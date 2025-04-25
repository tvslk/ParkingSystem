import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_UA_REGEX = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
const MAP_ROUTE_REGEX = /^\/map(\/|$)/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  MOBILE_UA_REGEX.lastIndex = 0; // Important when using /g or /i flags
  const isMobile = MOBILE_UA_REGEX.test(userAgent);

  // Debug logs
  console.log('User-Agent:', userAgent);
  console.log('Is Mobile:', isMobile);

  // Skip static and API requests
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Security headers for /map
  if (MAP_ROUTE_REGEX.test(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', "default-src 'self'");
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000');
    return response;
  }

  // Mobile/desktop redirect logic
  if (isMobile && !pathname.startsWith('/m')) {
    const url = request.nextUrl.clone();
    url.pathname = '/m' + pathname;
    return NextResponse.redirect(url);
  }

  if (!isMobile && pathname.startsWith('/m')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/m/, '') || '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
