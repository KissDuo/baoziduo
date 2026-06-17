import { NextRequest, NextResponse, userAgent } from 'next/server';

// Routes that should NOT be device-redirected
const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/login',
  '/register',
  '/static',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const { device } = userAgent(request);
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  const viewport = isMobile ? 'mobile' : 'pc';

  // Block mobile access to IELTS (desktop only)
  if (pathname.startsWith('/ielts') && isMobile) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Set viewport cookie for layouts to consume
  response.cookies.set('viewport', viewport, {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'lax',
  });

  response.headers.set('x-viewport', viewport);

  // Set default language cookie if not present
  if (!request.cookies.get('lang')) {
    response.cookies.set('lang', 'zh', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
