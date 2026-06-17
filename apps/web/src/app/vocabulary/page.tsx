import { cookies } from 'next/headers';
import PCVocabularyPage from '@/components/pc/vocabulary-page';
import MobileVocabularyPage from '@/components/mobile/vocabulary-page';

export default async function VocabularyPage() {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';

  if (viewport === 'mobile') {
    return <MobileVocabularyPage />;
  }
  return <PCVocabularyPage />;
}
