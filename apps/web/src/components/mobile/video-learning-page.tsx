'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { videoService, type TranscriptSegment, type VideoPlatform } from '@/services/video.service';
import { TranscriptPanel } from '@/components/shared/TranscriptPanel';

type ProgressStage = 'idle' | 'fetching' | 'translating';

export default function MobileVideoLearningPage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<VideoPlatform | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [stage, setStage] = useState<ProgressStage>('idle');
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const progressTimerRef = useRef<ReturnType<typeof setInterval>>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setLoading(true);
    setSegments([]);
    setStage('fetching');
    setProgress(0);

    progressTimerRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 2, 25));
    }, 200);

    try {
      const result = await videoService.getTranscript(url.trim());
      clearInterval(progressTimerRef.current);
      setStage('translating');
      setProgress(30);
      setVideoId(result.videoId);
      setPlatform(result.platform);
      setSegments(result.segments);
      setProgress(100);
    } catch (err: any) {
      clearInterval(progressTimerRef.current);
      setError(err.message || '加载失败');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setStage('idle');
        setProgress(0);
      }, 300);
    }
  }

  useEffect(() => {
    if (!videoId) return;
    timerRef.current = setInterval(() => {
      playerRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 2 }),
        '*'
      );
    }, 500);

    function handleMessage(e: MessageEvent) {
      try {
        const data = JSON.parse(e.data);
        if (data && typeof data.info?.currentTime === 'number') {
          setCurrentTime(data.info.currentTime);
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage);

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId]);

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [time, true] }),
      '*'
    );
  }, []);

  return (
    <div className="px-4 py-4 pb-20">
      <h1 className="text-xl font-bold text-slate-900 mb-4">视频学习</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴 YouTube 链接..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '处理中' : '开始'}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      {/* Progress bar */}
      {loading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-600">
              {stage === 'fetching' ? '获取字幕中...' : 'AI 翻译中...'}
            </span>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {videoId && !loading && (
        <>
          <div className="relative w-full mb-3" style={{ paddingBottom: '56.25%' }}>
            {platform === 'bilibili' ? (
              <iframe
                ref={playerRef}
                src={`https://player.bilibili.com/player.html?bvid=${videoId}&page=1&high_quality=1`}
                className="absolute inset-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                ref={playerRef}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-sm text-slate-600 mb-2"
          >
            <span>{showTranscript ? '▼' : '▶'}</span>
            {showTranscript ? '收起字幕' : '展开字幕'} ({segments.length} 句)
          </button>

          {showTranscript && (
            <div className="border rounded-lg bg-white overflow-hidden" style={{ maxHeight: '50vh' }}>
              <TranscriptPanel segments={segments} currentTime={currentTime} onSeek={handleSeek} />
            </div>
          )}
        </>
      )}

      {!videoId && !loading && (
        <div className="text-center py-12 text-slate-400">
          <p>粘贴 YouTube 链接开始学习</p>
        </div>
      )}
    </div>
  );
}
