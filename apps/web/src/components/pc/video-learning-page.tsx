'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { videoService, type TranscriptSegment, type VideoPlatform } from '@/services/video.service';
import { TranscriptPanel } from '@/components/shared/TranscriptPanel';

type ProgressStage = 'idle' | 'fetching' | 'translating';

export default function PcVideoLearningPage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<VideoPlatform | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
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

    // Simulate progress during fetch
    progressTimerRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 2, 25));
    }, 200);

    try {
      const result = await videoService.getTranscript(url.trim());

      clearInterval(progressTimerRef.current);
      setStage('translating');
      setProgress(30);

      // Note: translation happens on the server within the same request,
      // so by the time we get the result, it's already translated.
      // The progress bar fills to 100% quickly.
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

  // Sync: poll YouTube player for current time
  useEffect(() => {
    if (!videoId) return;
    timerRef.current = setInterval(() => {
      playerRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1 }),
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">视频学习</h1>

      {/* URL input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="粘贴 YouTube 链接，如 https://www.youtube.com/watch?v=..."
          className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? '处理中...' : '开始学习'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">{error}</div>
      )}

      {/* Progress bar */}
      {loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              {stage === 'fetching' ? '正在从 YouTube 获取字幕...' : '正在 AI 翻译字幕...'}
            </span>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stage === 'fetching'
              ? '连接 YouTube 获取英文字幕...'
              : `共 ${segments.length || '?'} 句，DeepSeek 批量翻译中...`}
          </p>
        </div>
      )}

      {/* Video + Transcript layout */}
      {videoId && !loading && (
        <div className="flex gap-6" style={{ height: 'calc(100vh - 260px)' }}>
          {/* Video player */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
          </div>

          {/* Transcript panel */}
          <div className="w-[420px] flex-shrink-0 border rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 border-b bg-slate-50">
              <h3 className="text-sm font-medium text-slate-700">
                字幕 ({segments.length} 句)
              </h3>
            </div>
            <TranscriptPanel segments={segments} currentTime={currentTime} onSeek={handleSeek} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!videoId && !loading && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">粘贴 YouTube 链接开始学习</p>
          <p className="text-sm mt-2">支持 youtube.com/watch、youtu.be、shorts 格式</p>
        </div>
      )}
    </div>
  );
}
