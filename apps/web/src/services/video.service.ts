import { api } from '@/lib/api-client';

export interface TranscriptSegment {
  start: number;
  duration: number;
  textEn: string;
  textZh: string;
}

export type VideoPlatform = 'youtube' | 'bilibili';

export interface VideoTranscript {
  platform: VideoPlatform;
  videoId: string;
  segments: TranscriptSegment[];
}

export const videoService = {
  async getTranscript(url: string): Promise<VideoTranscript> {
    return api.post('/videos/transcript', { url });
  },
};
