'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Sentence {
  id: number; index: number; startTime: number; endTime: number;
  text: string; translation: string;
}

export default function ListeningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ title: string; sourceUrl: string; sentences: Sentence[]; category: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeSentence, setActiveSentence] = useState(-1);

  // Mode
  const [mode, setMode] = useState<'full' | 'sentence'>('full');
  const [showTranslation, setShowTranslation] = useState(false);

  // Sentence dictation
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/listening/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!audioRef.current || !data) return;
    const audio = audioRef.current;
    audio.playbackRate = speed;
    const tick = () => {
      setCurrentTime(audio.currentTime);
      const idx = data.sentences.findIndex(s => audio.currentTime >= s.startTime && audio.currentTime < s.endTime);
      setActiveSentence(idx);
    };
    audio.addEventListener('timeupdate', tick);
    return () => audio.removeEventListener('timeupdate', tick);
  }, [data, speed]);

  // Sentence mode: play current sentence only
  const playCurrentSentence = () => {
    if (!audioRef.current || !data) return;
    const s = data.sentences[currentSentenceIdx];
    if (!s) return;
    const audio = audioRef.current;
    audio.currentTime = s.startTime;
    audio.play();
    setPlaying(true);
    // Stop at end
    const stop = () => { if (audio.currentTime >= s.endTime) { audio.pause(); setPlaying(false); audio.removeEventListener('timeupdate', stop); } };
    audio.addEventListener('timeupdate', stop);
  };

  const checkInput = async () => {
    if (!userInput.trim()) return;
    try {
      const res = await fetch(`http://localhost:3001/api/v1/listening/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentenceIndex: currentSentenceIdx, userInput }),
      });
      const result = await res.json();
      setCheckResult(result);
    } catch {}
  };

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (!data) return <div className="p-8 text-red-500">Transcript not found</div>;

  const currentSentence = data.sentences[currentSentenceIdx];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">{data.title}</h1>

      {/* Audio player */}
      <audio ref={audioRef} src={data.sourceUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
        <button onClick={() => audioRef.current?.paused ? audioRef.current?.play() : audioRef.current?.pause()}
          className="px-3 py-1.5 bg-primary-600 text-white rounded text-sm">{playing ? '⏸' : '▶'}</button>
        <input type="range" min={0} max={audioRef.current?.duration || 0} value={currentTime} step={0.1}
          onChange={e => { if (audioRef.current) audioRef.current.currentTime = +e.target.value; }}
          className="flex-1" />
        <span className="text-xs text-slate-500">{formatTime(currentTime)}</span>
        <select value={speed} onChange={e => { const v = +e.target.value; setSpeed(v); if (audioRef.current) audioRef.current.playbackRate = v; }}
          className="text-xs border rounded px-1 py-0.5">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <option key={s} value={s}>{s}x</option>)}
        </select>
      </div>

      {/* Mode switch */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setMode('full')} className={`px-3 py-1 text-sm rounded ${mode === 'full' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>全文精听</button>
        <button onClick={() => setMode('sentence')} className={`px-3 py-1 text-sm rounded ${mode === 'sentence' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>逐句精听</button>
        {mode === 'full' && (
          <button onClick={() => setShowTranslation(!showTranslation)}
            className="ml-auto px-3 py-1 text-sm border rounded">{showTranslation ? '隐藏译文' : '显示译文'}</button>
        )}
      </div>

      {/* Full-text mode */}
      {mode === 'full' && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {data.sentences.map((s, i) => (
            <div key={s.id}
              onClick={() => { if (audioRef.current) { audioRef.current.currentTime = s.startTime; audioRef.current.play(); } }}
              className={`p-2 rounded cursor-pointer transition-colors ${i === activeSentence ? 'bg-primary-100 border-l-4 border-primary-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
              <p className="text-sm text-slate-800">{s.text}</p>
              {showTranslation && <p className="text-xs text-slate-500 mt-0.5">{s.translation}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Sentence dictation mode */}
      {mode === 'sentence' && currentSentence && (
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <span className="text-sm text-slate-500">句子 {currentSentenceIdx + 1} / {data.sentences.length}</span>
          </div>

          {/* Play button */}
          <div className="text-center mb-4">
            <button onClick={playCurrentSentence}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm">🔊 播放当前句</button>
          </div>

          {/* Input area */}
          <textarea value={userInput} onChange={e => { setUserInput(e.target.value); setShowAnswer(false); setCheckResult(null); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); checkInput(); } }}
            placeholder="输入你听到的内容..."
            className="w-full border-2 border-slate-300 rounded-lg p-3 text-sm min-h-[80px] focus:border-primary-400 outline-none" />

          {/* Word-by-word check result */}
          {checkResult && !showAnswer && (
            <div className="mt-2 flex flex-wrap gap-1">
              {checkResult.wordResults?.map((w: any, i: number) => (
                <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${w.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {w.input || '___'}
                </span>
              ))}
            </div>
          )}

          {/* Answer display */}
          {showAnswer && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{currentSentence.text}</p>
              <p className="text-xs text-slate-500 mt-1">{currentSentence.translation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => { setCurrentSentenceIdx(Math.max(0, currentSentenceIdx - 1)); setUserInput(''); setShowAnswer(false); setCheckResult(null); }}
              disabled={currentSentenceIdx === 0} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">上一句</button>
            <button onClick={() => { setShowAnswer(!showAnswer); if (!showAnswer) checkInput(); }}
              className="px-3 py-1.5 text-sm border rounded">{showAnswer ? '隐藏答案' : '展示答案'}</button>
            <button onClick={playCurrentSentence}
              className="px-3 py-1.5 text-sm border rounded">重播</button>
            <button onClick={() => { setCurrentSentenceIdx(Math.min(data.sentences.length - 1, currentSentenceIdx + 1)); setUserInput(''); setShowAnswer(false); setCheckResult(null); }}
              disabled={currentSentenceIdx >= data.sentences.length - 1} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">下一句</button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
