'use client';

import { useEffect, useRef } from 'react';
import type { TranscriptSegment } from '@/services/video.service';

export function TranscriptPanel({
  segments,
  currentTime,
  onSeek,
}: {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const activeIdx = segments.findIndex(
    (s) => currentTime >= s.start && currentTime < s.start + s.duration
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIdx]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  if (!segments.length) return null;

  return (
    <div ref={containerRef} className="overflow-y-auto h-full">
      {segments.map((seg, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={i}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSeek(seg.start)}
            className={`cursor-pointer px-4 py-2.5 border-b border-slate-100 transition-colors ${
              isActive
                ? 'bg-primary-50 border-l-2 border-l-primary-500'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono ${isActive ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
                {formatTime(seg.start)}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
              {seg.textEn}
            </p>
            {seg.textZh && (
              <p className={`text-sm leading-relaxed mt-0.5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                {seg.textZh}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
