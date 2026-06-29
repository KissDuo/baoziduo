'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import { WordPopup } from '@/components/shared/WordPopup';

const NAV_LINKS = [
  { href: '/articles', key: 'nav.articles', match: '/articles' },
  { href: '/ielts', key: 'nav.ielts', match: '/ielts' },
  { href: '/listening', key: 'nav.listening', match: '/listening' },
  { href: '/videos', key: 'nav.videos', match: '/videos' },
  { href: '/vocabulary', key: 'nav.vocabulary', match: '/vocabulary' },
];

interface LayoutUser {
  id: number;
  email?: string;
}

export function PCLayoutShell({ children, user }: { children: React.ReactNode; user?: LayoutUser | null }) {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();

  return (
    <div className="pc-layout">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          {/* Left: logo + nav — fixed width */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary-600 flex-shrink-0">
              宝子多EN
            </Link>
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.match);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors text-sm ${
                      isActive
                        ? 'text-primary-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
          {/* Center: search — fills remaining */}
          <SearchBox />
          {/* Right: lang + login — fixed width */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded px-2 py-1 transition-colors flex items-center gap-1"
            >
              <span>{lang === 'zh' ? '🇨🇳' : '🇬🇧'}</span>
              <span>{lang === 'zh' ? '中文' : 'English'}</span>
            </button>

            {user ? (
              <div className="relative group">
                <button className="text-sm text-slate-600 hover:text-slate-900 py-2 flex items-center gap-1">
                  {user.email || `User #${user.id}`}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    href="/vocabulary"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                  >
                    <span>📖</span>
                    {t('nav.my_vocab')}
                  </Link>
                  <a
                    href="/login"
                    className="block px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 rounded-b-lg border-t"
                    onClick={async (e) => {
                      e.preventDefault();
                      try { await fetch('http://localhost:3001/api/v1/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
                      window.location.href = '/login';
                    }}
                  >
                    {t('nav.logout')}
                  </a>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900">
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="border-t py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} 宝子多EN. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ── Search box for navigation bar ──
function SearchBox() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  const doSearch = async () => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const data = await api.get<any[]>('/vocabulary/search', { q: query.trim() });
      setResults(data || []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const doAISearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await api.post<any>('/vocabulary/ai-search', { q: query.trim() });
      if (result && !result.error) {
        setSelected(result);
        setOpen(false);
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0 ml-6 mr-4">
      <div className="flex">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
          placeholder={t('nav.search')} className="flex-1 text-sm border border-slate-200 rounded-l-lg px-3 py-1.5 focus:outline-none focus:border-primary-400 transition-colors" />
        <button onClick={doSearch} className="px-3 py-1.5 bg-primary-600 text-white rounded-r-lg text-sm hover:bg-primary-700 transition-colors">🔍</button>
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border rounded-xl shadow-xl z-50 w-80 max-h-[400px] overflow-y-auto">
          {loading && <div className="p-4 text-sm text-slate-400">Searching...</div>}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div onClick={doAISearch} className="p-4 text-sm text-primary-600 hover:bg-primary-50 cursor-pointer border-t border-slate-100">
              🤖 AI查询（请输入完整单词或短语）
            </div>
          )}
          {!loading && results.length === 0 && query.trim().length < 2 && (
            <div className="p-4 text-sm text-slate-400">No results</div>
          )}
          {results.map((r, i) => (
            <div key={i} onClick={() => setSelected(r)} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">{r.word}</span>
                {r.partOfSpeech && <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{r.partOfSpeech}</span>}
              </div>
              {(r.phoneticUk || r.phoneticUs) && (
                <p className="text-xs text-slate-400 mb-1">
                  {r.phoneticUk && <span>英[{r.phoneticUk.replace(/^\/|\/$/g, '')}]</span>}
                  {r.phoneticUk && r.phoneticUs && r.phoneticUk !== r.phoneticUs && <span> 美[{r.phoneticUs.replace(/^\/|\/$/g, '')}]</span>}
                </p>
              )}
              <p className="text-sm text-slate-700">{r.translation}</p>
              {r.tags && r.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {r.tags.map((tag: string) => <span key={tag} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {selected && (
        <WordPopup word={selected} inVocabulary={false} isMobile={false}
          onClose={() => setSelected(null)}
          onAddToVocabulary={() => {}}
          onRemoveFromVocabulary={() => {}}
        />
      )}
    </div>
  );
}
