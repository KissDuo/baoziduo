import { cookies } from 'next/headers';
import PCHomePage from '@/components/pc/home-page';
import MobileHomePage from '@/components/mobile/home-page';

function parseJwtPayload(token: string): { sub: number; email?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';
  const accessToken = cookieStore.get('access_token')?.value;
  const jwtPayload = accessToken ? parseJwtPayload(accessToken) : null;
  const user = jwtPayload ? { id: jwtPayload.sub, email: jwtPayload.email } : null;

  if (viewport === 'mobile') {
    return <MobileHomePage user={user} />;
  }
  return <PCHomePage user={user} />;
}
