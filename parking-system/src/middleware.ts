import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_UA_REGEX = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
const MAP_ROUTE_REGEX = /^\/map(\/|$)/i;
const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  MOBILE_UA_REGEX.lastIndex = 0; // Reset regex state
  const isMobile = MOBILE_UA_REGEX.test(userAgent);

  // Skip static files, API, and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    FILE_EXTENSION_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Apply security headers to /map routes
  if (MAP_ROUTE_REGEX.test(pathname)) {
    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; object-src 'none';`
    );
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000');
    return response;
  }

  // Mobile/desktop redirect logic (only for non-static paths)
  if (isMobile && !pathname.startsWith('/m')) {
    const url = request.nextUrl.clone();
    url.pathname = `/m${pathname}`;
    return NextResponse.redirect(url);
  }

  if (!isMobile && pathname.startsWith('/m')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/m/, '') || '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}