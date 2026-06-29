'use client';

import { GeoProvider } from '@/lib/geo-context';

export function GeoWrapper({ children }: { children: React.ReactNode }) {
  return <GeoProvider>{children}</GeoProvider>;
}
