import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const p = new PrismaClient();

interface ArticleInput {
  slug: string;
  title: string;
  titleZh: string;
  sourceUrl: string;
  summary: string;
}

const articles: ArticleInput[] = [
  {
    slug: 'floridas-deadliest-woman-python-hunter',
    title: "Florida's deadliest python hunter is a conservationist at heart",
    titleZh: '佛罗里达最致命的蟒蛇猎手其实是一位保护主义者',
    sourceUrl: 'https://www.nationalgeographic.com/environment/article/floridas-deadliest-woman-python-hunter',
    summary: "Taylor Stanberry caught 60 Burmese pythons during the 2025 Florida Python Challenge, setting a state record. But she doesn't enjoy killing — she views it as necessary conservation to protect the Everglades ecosystem.",
  },
  {
    slug: 'how-to-plan-the-ultimate-road-trip-through-tasmania',
    title: 'How to plan the ultimate road trip through Tasmania',
    titleZh: '如何规划一次终极塔斯马尼亚自驾之旅',
    sourceUrl: 'https://www.nationalgeographic.com/travel/article/how-to-plan-the-ultimate-road-trip-through-tasmania',
    summary: "A 5-day road trip itinerary through Tasmania: from Hobart's glowing wildlife tours to Cradle Mountain's breathtaking hikes, this Australian island offers an unforgettable journey from beach to bush.",
  },
  {
    slug: 'women-strength-training-hormones-muscle-growth',
    title: 'Why strength training advice for women is mostly wrong',
    titleZh: '女性力量训练建议为何大多错误',
    sourceUrl: 'https://www.nationalgeographic.com/health/article/women-strength-training-hormones-muscle-growth',
    summary: "New research shows women have similar capacity for muscle growth as men. The 'cycle-syncing' trend and hormone-based training advice lack scientific evidence. Progressive overload works for everyone.",
  },
];

async function fetchAndParse(url: string): Promise<string[]> {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  });
  const html = await resp.text();

  const paragraphs: string[] = [];
  const pRe = /<p[^>]*>(.*?)<\/p>/gis;
  let m;
  while ((m = pRe.exec(html)) !== null) {
    const text = m[1]
      .replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/\s+/g, ' ')
      .trim();

    // Filter out short/non-content paragraphs
    if (text.length > 80 && !text.includes('class=') && !text.startsWith('<') && !text.startsWith('function')
      && !text.includes('{') && !text.includes('window.') && !text.includes('ad-slot')
      && !text.includes('newsletter') && !text.includes('subscribe')) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

async function main() {
  for (const article of articles) {
    console.log(`\nFetching: ${article.title}`);
    try {
      const paragraphs = await fetchAndParse(article.sourceUrl);
      console.log(`  Got ${paragraphs.length} paragraphs`);

      const fullContent = paragraphs.join('\n\n');
      const wordCount = fullContent.split(/\s+/).length;

      const existing = await p.article.findUnique({ where: { slug: article.slug } });
      if (existing) {
        await p.articleParagraph.deleteMany({ where: { articleId: existing.id } });
      }

      const saved = await p.article.upsert({
        where: { slug: article.slug },
        update: {
          title: article.title,
          titleZh: article.titleZh,
          source: 'National Geographic',
          summary: article.summary,
          content: fullContent,
          difficultyLevel: 'intermediate',
          wordCount,
          estimatedMinutes: Math.max(3, Math.round(wordCount / 200)),
          isPublished: true,
          publishDate: new Date('2026-06-19'),
        },
        create: {
          title: article.title,
          titleZh: article.titleZh,
          slug: article.slug,
          source: 'National Geographic',
          summary: article.summary,
          content: fullContent,
          difficultyLevel: 'intermediate',
          wordCount,
          estimatedMinutes: Math.max(3, Math.round(wordCount / 200)),
          isPublished: true,
          publishDate: new Date('2026-06-19'),
        },
      });

      for (let i = 0; i < paragraphs.length; i++) {
        await p.articleParagraph.create({
          data: {
            articleId: saved.id,
            paragraphIndex: i,
            contentEn: paragraphs[i],
          },
        });
      }

      console.log(`  ✅ Done: ${wordCount} words, ${paragraphs.length} paragraphs`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  await p.$disconnect();
  console.log('\nAll done!');
}

main().catch(console.error);
