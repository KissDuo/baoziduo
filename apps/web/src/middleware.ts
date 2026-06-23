import { NextRequest, NextResponse, userAgent } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/api', '/_next', '/static', '/favicon.ico'];

const PROTECTED_PATHS = ['/articles', '/videos', '/ielts', '/vocabulary'];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Auth check for protected routes
  if (isProtected(pathname)) {
    const hasToken = request.cookies.get('access_token') || request.cookies.get('refresh_token');
    if (!hasToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  const { device } = userAgent(request);
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  const viewport = isMobile ? 'mobile' : 'pc';

  // Block mobile access to IELTS (desktop only)
  if (pathname.startsWith('/ielts') && isMobile) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  response.cookies.set('viewport', viewport, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  });

  response.headers.set('x-viewport', viewport);

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
