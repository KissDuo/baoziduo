import { cookies } from 'next/headers';
import { VideoGuard } from '@/components/shared/VideoGuard';

export default async function VideosPage() {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';

  return <VideoGuard viewport={viewport} />;
}
