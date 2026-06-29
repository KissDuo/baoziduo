import type { MetadataRoute } from 'next';

const BASE = 'https://baoziduo.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: BASE, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE}/articles`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE}/ielts`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE}/listening`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE}/videos`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE}/vocabulary`, changeFrequency: 'weekly' as const, priority: 0.8 },
  ];

  // Dynamic routes could be added here (articles, exams)
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5201/api/v1';
    // Fetch articles
    const articlesRes = await fetch(`${apiBase}/articles?page=1&pageSize=100`);
    const articles = articlesRes.ok ? (await articlesRes.json()) : { items: [] };
    const articleUrls = (articles.items || []).map((a: any) => ({
      url: `${BASE}/articles/${a.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...articleUrls];
  } catch {
    return staticRoutes;
  }
}
