'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLang } from '@/lib/i18n';

interface Sentence {
  id: number; index: number; startTime: number; endTime: number;
  text: string; translation: string; audioUrl?: string;
}

export default function ListeningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const [data, setData] = useState<{ title: string; sourceUrl: string; sentences: Sentence[]; category: string; isDictation?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const isDictation = data?.isDictation;

  // Player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeSentence, setActiveSentence] = useState(-1);

  // Mode — dictation defaults to sentence-only (set after data loads)
  const [mode, setMode] = useState<'full' | 'sentence'>('full');
  useEffect(() => { if (isDictation) setMode('sentence'); }, [isDictation]);
  const [showTranslation, setShowTranslation] = useState(false);

  // Sentence dictation
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [userWords, setUserWords] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean[] | null>(null);
  const wordInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5201/api/v1/listening/${id}`)
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

  // Sentence mode: play current sentence (dictation uses per-item audio)
  const playCurrentSentence = () => {
    if (!audioRef.current || !data) return;
    const s = data.sentences[currentSentenceIdx];
    if (!s) return;
    const audio = audioRef.current;
    if (isDictation && s.audioUrl) {
      audio.src = s.audioUrl;
      audio.load();
      audio.oncanplaythrough = () => { audio.play(); setPlaying(true); };
    } else {
      audio.currentTime = s.startTime;
      audio.play();
      setPlaying(true);
    }
    if (!isDictation) {
      const stop = () => { if (audio.currentTime >= s.endTime) { audio.pause(); setPlaying(false); audio.removeEventListener('timeupdate', stop); } };
      audio.addEventListener('timeupdate', stop);
    } else {
      const ended = () => { setPlaying(false); audio.removeEventListener('ended', ended); };
      audio.addEventListener('ended', ended);
    }
  };

  // Initialize word inputs when sentence changes
  useEffect(() => {
    if (!data) return;
    const words = data.sentences[currentSentenceIdx]?.text.split(/\s+/) || [];
    setUserWords(new Array(words.length).fill(''));
    setCheckResult(null);
    setShowAnswer(false);
  }, [currentSentenceIdx, data]);

  const confirmAnswer = () => {
    if (!currentSentence) return;
    const answerWords = currentSentence.text.split(/\s+/);
    const results = answerWords.map((aw: string, i: number) =>
      (userWords[i] || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '') === aw.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    setCheckResult(results);
  };

  const handleWordKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
      const next = wordInputRefs.current[idx + 1];
      if (next) next.focus();
    }
  };

  const handleWordChange = (idx: number, val: string) => {
    const next = [...userWords];
    next[idx] = val;
    setUserWords(next);
    setCheckResult(null);
    setShowAnswer(false);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (!data) return <div className="p-8 text-red-500">Transcript not found</div>;

  const currentSentence = data.sentences[currentSentenceIdx];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">{data.title}</h1>

      {/* Audio player */}
      <audio ref={audioRef} src={data.sourceUrl || undefined} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

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

      {/* Mode switch — hidden for dictation (sentence-only) */}
      {!isDictation && (
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setMode('full')} className={`px-3 py-1 text-sm rounded ${mode === 'full' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>全文精听</button>
          <button onClick={() => setMode('sentence')} className={`px-3 py-1 text-sm rounded ${mode === 'sentence' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>逐句精听</button>
          {mode === 'full' && (
            <button onClick={() => setShowTranslation(!showTranslation)}
              className="ml-auto px-3 py-1 text-sm border rounded">{showTranslation ? '隐藏译文' : '显示译文'}</button>
          )}
        </div>
      )}

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
      {mode === 'sentence' && currentSentence && (() => {
        const words = currentSentence.text.split(/\s+/);
        return (
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <span className="text-sm text-slate-500">句子 {currentSentenceIdx + 1} / {data.sentences.length}</span>
          </div>

          <div className="text-center mb-4">
            <button onClick={playCurrentSentence}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm">🔊 播放当前句</button>
          </div>

          {/* Word inputs grid */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {words.map((word: string, i: number) => {
              const checked = checkResult?.[i];
              const isCorrect = checked === true;
              const isWrong = checked === false;
              const wlen = isDictation ? Math.max(100, word.length * 20) : Math.max(60, word.length * 16);
              return (
                <input key={i} ref={el => { wordInputRefs.current[i] = el; }}
                  value={userWords[i] || ''}
                  onChange={e => handleWordChange(i, e.target.value)}
                  onKeyDown={e => handleWordKeyDown(e, i)}
                  placeholder={isDictation ? t('dictation.placeholder') : word.replace(/[a-zA-Z]/g, '_')}
                  className={`text-center text-sm px-2 py-1.5 rounded border-2 outline-none transition-colors ${
                    isCorrect ? 'border-green-400 bg-green-50 text-green-700' :
                    isWrong ? 'border-red-400 bg-red-50 text-red-600' :
                    'border-slate-300 focus:border-primary-400'
                  }`}
                  style={{ width: wlen + 'px' }}
                />
              );
            })}
          </div>

          {/* Answer display */}
          {showAnswer && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{currentSentence.text}</p>
              {/* Only show translation for IELTS listening, not dictation */}
              {!isDictation && <p className="text-xs text-slate-500 mt-1">{currentSentence.translation}</p>}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => setCurrentSentenceIdx(Math.max(0, currentSentenceIdx - 1))}
              disabled={currentSentenceIdx === 0} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">上一句</button>
            <button onClick={confirmAnswer}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded font-medium">确认</button>
            <button onClick={() => setShowAnswer(!showAnswer)}
              className="px-3 py-1.5 text-sm border rounded">{showAnswer ? '隐藏答案' : '展示答案'}</button>
            <button onClick={playCurrentSentence}
              className="px-3 py-1.5 text-sm border rounded">重播</button>
            <button onClick={() => setCurrentSentenceIdx(Math.min(data.sentences.length - 1, currentSentenceIdx + 1))}
              disabled={currentSentenceIdx >= data.sentences.length - 1} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">下一句</button>
          </div>
        </div>
      )})()}
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
