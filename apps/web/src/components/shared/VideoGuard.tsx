'use client';

import { useGeo } from '@/lib/geo-context';
import { NotFoundPage } from './NotFoundPage';
import PcVideoLearningPage from '@/components/pc/video-learning-page';
import MobileVideoLearningPage from '@/components/mobile/video-learning-page';

export function VideoGuard({ viewport }: { viewport: string }) {
  const { isChina } = useGeo();

  // Still loading geo — show nothing (brief moment)
  if (isChina === null) return null;

  // Confirmed in China — show 404
  if (isChina === true) return <NotFoundPage />;

  // Confirmed outside China — show video page
  if (viewport === 'mobile') return <MobileVideoLearningPage />;
  return <PcVideoLearningPage />;
}
