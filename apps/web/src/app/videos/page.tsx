import { cookies } from 'next/headers';
import PcVideoLearningPage from '@/components/pc/video-learning-page';
import MobileVideoLearningPage from '@/components/mobile/video-learning-page';

export default async function VideosPage() {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';

  if (viewport === 'mobile') return <MobileVideoLearningPage />;
  return <PcVideoLearningPage />;
}
