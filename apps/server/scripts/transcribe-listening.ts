import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/index.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const p = new PrismaClient();
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

// whisper-cpp CLI: uses local GGML model
const WHISPER_BIN = 'whisper-cli';
const WHISPER_MODEL = '/tmp/ggml-base.bin';

async function whisperTranscribe(audioUrl: string): Promise<{ text: string; segments: { start: number; end: number; text: string }[] } | null> {
  console.log(`  Downloading audio: ${audioUrl}`);
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) { console.error(`  Failed to download audio: ${audioRes.status}`); return null; }
  const audioBuffer = await audioRes.arrayBuffer();

  const tmpDir = os.tmpdir();
  const audioPath = path.join(tmpDir, `whisper-input-${Date.now()}.mp3`);
  fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
  console.log(`  Audio saved: ${(audioBuffer.byteLength / 1024 / 1024).toFixed(1)}MB`);

  console.log(`  Transcribing with whisper-cpp...`);
  try {
    const result = execSync(
      `${WHISPER_BIN} -m ${WHISPER_MODEL} -f ${audioPath} -oj -l en`,
      { timeout: 300000, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    // whisper-cpp outputs a .json file with segments
    const jsonPath = audioPath.replace('.mp3', '.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const segments = (jsonData.transcription || []).map((s: any) => ({
      start: s.timestamps?.from ? parseFloat(s.timestamps.from) / 100 : s.offsets?.from / 100 || 0,
      end: s.timestamps?.to ? parseFloat(s.timestamps.to) / 100 : s.offsets?.to / 100 || 0,
      text: (s.text || '').trim(),
    })).filter((s: any) => s.text.length > 0);

    // Cleanup
    try { fs.unlinkSync(audioPath); fs.unlinkSync(jsonPath); } catch {}

    if (segments.length === 0) {
      // Fallback: single segment with full text
      const fullText = jsonData.text || '';
      return { text: fullText, segments: [{ start: 0, end: 0, text: fullText }] };
    }

    console.log(`  Got ${segments.length} segments`);
    return { text: segments.map(s => s.text).join(' '), segments };
  } catch (e: any) {
    console.error(`  whisper-cpp error: ${e.message}`);
    try { fs.unlinkSync(audioPath); } catch {}
    return null;
  }
}

async function translateSentences(sentences: string[]): Promise<string[]> {
  const text = sentences.join('\n---\n');
  const prompt = `Translate each of the following English sentences into Chinese. Return ONLY a JSON array of strings, one translation per sentence, in the same order:\n\n${text}`;

  try {
    const res = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.deepseek.apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) { console.error(`  Translation error: ${res.status}`); return sentences.map(() => ''); }
    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const translations = JSON.parse(jsonStr);
    return Array.isArray(translations) ? translations : sentences.map(() => '');
  } catch (e) {
    console.error(`  Translation parse error: ${e}`);
    return sentences.map(() => '');
  }
}

async function transcribeSection(sectionId: number) {
  const section = await p.iELTSExamSection.findUnique({
    where: { id: sectionId },
    include: { exam: true },
  });
  if (!section) { console.error(`Section ${sectionId} not found`); return; }
  if (!section.audioUrl) { console.error(`Section ${sectionId} has no audioUrl`); return; }

  console.log(`\nTranscribing: ${section.exam.title} Part ${section.sectionIndex}`);
  console.log(`  Audio: ${section.audioUrl}`);

  // Check existing
  const existing = await p.listeningTranscript.findUnique({ where: { sectionId } });
  if (existing) {
    console.log(`  Transcript already exists (id=${existing.id}, status=${existing.status})`);
    return;
  }

  // Create pending transcript
  const transcript = await p.listeningTranscript.create({
    data: {
      sectionId,
      sourceUrl: section.audioUrl,
      status: 'pending',
      category: 'ielts',
    },
  });
  console.log(`  Created transcript id=${transcript.id}`);

  // Whisper transcription
  const result = await whisperTranscribe(section.audioUrl);
  if (!result) {
    await p.listeningTranscript.update({ where: { id: transcript.id }, data: { status: 'failed' } });
    return;
  }

  await p.listeningTranscript.update({ where: { id: transcript.id }, data: { status: 'transcribed' } });

  // Translate
  const texts = result.segments.map(s => s.text);
  console.log(`  Translating ${texts.length} sentences...`);
  const translations = await translateSentences(texts);

  // Insert sentences
  for (let i = 0; i < result.segments.length; i++) {
    const seg = result.segments[i]!;
    await p.listeningSentence.create({
      data: {
        transcriptId: transcript.id,
        index: i,
        startTime: seg.start,
        endTime: seg.end,
        text: seg.text,
        translation: translations[i] || '',
      },
    });
  }

  await p.listeningTranscript.update({ where: { id: transcript.id }, data: { status: 'ready' } });
  console.log(`  ✅ Done! ${result.segments.length} sentences`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: tsx scripts/transcribe-listening.ts <sectionId|all>');
    return;
  }

  if (arg === 'all') {
    // Transcribe all IELTS listening sections that have audioUrl
    const sections = await p.iELTSExamSection.findMany({
      where: {
        exam: { type: 'listening' },
        audioUrl: { not: null },
        transcript: null,  // only those without transcript yet
      },
      include: { exam: true },
      orderBy: { id: 'asc' },
    });
    console.log(`Found ${sections.length} sections to transcribe`);
    for (const s of sections) {
      try { await transcribeSection(s.id); } catch (e) { console.error(`  Error: ${e}`); }
    }
    console.log('\nAll done!');
  } else {
    await transcribeSection(parseInt(arg));
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
