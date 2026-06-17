import { cookies } from 'next/headers';
import PCArticleReaderPage from '@/components/pc/article-reader-page';
import MobileArticleReaderPage from '@/components/mobile/article-reader-page';

export default async function ArticleReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';
  const { slug } = await params;

  if (viewport === 'mobile') {
    return <MobileArticleReaderPage slug={slug} />;
  }
  return <PCArticleReaderPage slug={slug} />;
}
