import Link from 'next/link';

async function getTranscripts() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${base}/listening`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function ListeningListPage() {
  const transcripts = await getTranscripts();

  const categories = [...new Set(transcripts.map((t: any) => t.category).filter(Boolean))] as string[];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">精听练习</h1>

      {categories.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 capitalize">{cat} 听力</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transcripts.filter((t: any) => t.category === cat).map((t: any) => (
              <Link key={t.id} href={`/listening/${t.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                <h3 className="font-medium text-slate-800 text-sm">{t.title}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>{t.sentenceCount} 句</span>
                  <span className="capitalize">{t.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {transcripts.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-2">暂无精听内容</p>
          <p className="text-sm">转录完成后将在此显示</p>
        </div>
      )}
    </div>
  );
}
