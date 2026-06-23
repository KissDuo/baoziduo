import { getTranscript } from 'get-youtube-transcript';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

interface RawSegment {
  text: string;
  start: number;
  duration: number;
}

interface BilingualSegment {
  start: number;
  duration: number;
  textEn: string;
  textZh: string;
}

// ── URL Parsing ──

type VideoPlatform = 'youtube' | 'bilibili';

function parseUrl(url: string): { platform: VideoPlatform; id: string } {
  // YouTube
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of ytPatterns) {
    const m = url.match(p);
    if (m) return { platform: 'youtube', id: m[1]! };
  }

  // Bilibili
  const blPatterns = [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]{10})/,
    /b23\.tv\/(BV[a-zA-Z0-9]{10})/,
  ];
  for (const p of blPatterns) {
    const m = url.match(p);
    if (m) return { platform: 'bilibili', id: m[1]! };
  }

  throw new AppError(400, 'Unsupported URL. Please provide a YouTube or Bilibili link.', 'INVALID_URL');
}

// ── YouTube Captions ──

async function fetchYouTubeCaptions(videoId: string): Promise<RawSegment[]> {
  try {
    const result = await getTranscript(videoId, { languages: ['en', 'en-US', 'en-GB'] });
    return result.segments
      .map((s: any) => ({ text: s.text?.trim() || '', start: s.start || 0, duration: s.duration || 3 }))
      .filter((s: RawSegment) => s.text.length > 0);
  } catch (err: any) {
    console.error('[YouTube] Transcript fetch failed:', err.message);
    throw new AppError(404, 'Could not fetch YouTube captions. The video may not have English subtitles.', 'YT_FETCH_FAILED');
  }
}

// ── Bilibili Captions ──

async function fetchBilibiliCaptions(bvid: string): Promise<RawSegment[]> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://www.bilibili.com',
  };

  // Step 1: Get video info (aid, cid, subtitle list)
  const viewResp = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { headers });
  if (!viewResp.ok) throw new AppError(502, 'Failed to access Bilibili API', 'BL_API_FAILED');

  const viewData = await viewResp.json() as any;
  if (viewData.code !== 0) {
    throw new AppError(404, `Bilibili video not found: ${viewData.message || 'unknown error'}`, 'BL_NOT_FOUND');
  }

  const title = viewData.data?.title || '';
  const subtitleList: any[] = viewData.data?.subtitle?.list || [];

  if (!subtitleList.length) {
    throw new AppError(404, `This Bilibili video does not have CC subtitles. "${title}". Many Bilibili videos have hardcoded captions that cannot be extracted.`, 'BL_NO_CC');
  }

  // Step 2: Find English track (preferred) or first available
  let track = subtitleList.find((t: any) => t.lan === 'en' || t.lan?.startsWith('en'));
  if (!track) track = subtitleList[0];

  if (!track?.subtitle_url) {
    throw new AppError(404, 'No subtitle URL found', 'BL_NO_URL');
  }

  // Step 3: Fetch subtitle JSON
  const subUrl = track.subtitle_url.startsWith('//') ? 'https:' + track.subtitle_url : track.subtitle_url;
  const subResp = await fetch(subUrl);
  if (!subResp.ok) throw new AppError(502, 'Failed to download subtitle file', 'BL_SUB_DL_FAILED');

  const subData = await subResp.json() as any;
  const body: any[] = subData.body || [];

  if (!body.length) {
    throw new AppError(404, 'Subtitle file is empty', 'BL_EMPTY_SUB');
  }

  const segments: RawSegment[] = body.map((item: any) => ({
    text: String(item.content || '').trim(),
    start: item.from || 0,
    duration: (item.to || 0) - (item.from || 0),
  })).filter((s: RawSegment) => s.text.length > 0);

  if (!segments.length) {
    throw new AppError(404, 'No usable subtitles found', 'BL_NO_VALID_SEGMENTS');
  }

  return segments;
}

// ── Translation ──

async function translateSegments(segments: RawSegment[]): Promise<string[]> {
  const numbered = segments.map((s, i) => `[${i}] ${s.text}`).join('\n');

  const prompt = `Translate these sentences to natural Chinese.
Return ONLY a JSON array of strings, one per line, same order. No extra text.

Example: ["你好世界", "今天天气真好"]

Sentences:
${numbered}`;

  const resp = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseek.apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    console.error('[DeepSeek] Translation failed');
    throw new AppError(502, 'Translation service unavailable', 'TRANSLATION_FAILED');
  }

  const data = await resp.json() as any;
  const content: string = data.choices?.[0]?.message?.content || '[]';

  try {
    const clean = content.replace(/```(?:json)?\s*/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const matches = content.match(/"([^"]*)"/g);
    return matches ? matches.map(m => m.replace(/^"|"$/g, '')) : segments.map(() => '');
  }
}

// ── Language Detection ──

function isEnglishVideo(segments: RawSegment[]): { isEnglish: boolean; englishRatio: number } {
  const allText = segments.map(s => s.text).join(' ');
  if (!allText.trim()) return { isEnglish: false, englishRatio: 0 };

  let englishChars = 0;
  let totalChars = 0;

  for (const ch of allText) {
    const code = ch.charCodeAt(0);
    // Skip whitespace and punctuation
    if (ch === ' ' || ch === '\n' || ch === '\t') continue;
    totalChars++;
    // ASCII letters (a-z, A-Z), digits, common punctuation
    if (
      (code >= 65 && code <= 90) ||   // A-Z
      (code >= 97 && code <= 122) ||  // a-z
      (code >= 48 && code <= 57)      // 0-9
    ) {
      englishChars++;
    }
  }

  const ratio = totalChars > 0 ? englishChars / totalChars : 0;
  return { isEnglish: ratio >= 0.3, englishRatio: ratio };
}

// ── Service ──

export class VideoService {
  async getTranscript(url: string): Promise<{
    platform: VideoPlatform;
    videoId: string;
    segments: BilingualSegment[];
  }> {
    const { platform, id } = parseUrl(url);

    // 1. Fetch captions based on platform
    let rawSegments: RawSegment[];
    if (platform === 'youtube') {
      rawSegments = await fetchYouTubeCaptions(id);
    } else {
      rawSegments = await fetchBilibiliCaptions(id);
    }

    if (!rawSegments.length) {
      throw new AppError(404, 'No captions found for this video', 'NO_CAPTIONS');
    }

    // 2. Check language — must be primarily English
    const langCheck = isEnglishVideo(rawSegments);
    if (!langCheck.isEnglish) {
      const pct = Math.round((1 - langCheck.englishRatio) * 100);
      throw new AppError(400, `This video is ${pct}% non-English content. Only English videos are supported for translation.`, 'NOT_ENGLISH');
    }

    // 3. Translate
    let translations: string[];
    try {
      translations = await translateSegments(rawSegments);
    } catch {
      translations = rawSegments.map(() => '');
    }

    // 3. Combine
    const segments: BilingualSegment[] = rawSegments.map((s, i) => ({
      start: s.start,
      duration: s.duration,
      textEn: s.text,
      textZh: translations[i] || '',
    }));

    return { platform, videoId: id, segments };
  }
}

export const videoService = new VideoService();
