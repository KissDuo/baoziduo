import { cookies } from 'next/headers';
import PCArticleListPage from '@/components/pc/article-list-page';
import MobileArticleListPage from '@/components/mobile/article-list-page';

export default async function ArticlesPage() {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';

  if (viewport === 'mobile') {
    return <MobileArticleListPage />;
  }
  return <PCArticleListPage />;
}
