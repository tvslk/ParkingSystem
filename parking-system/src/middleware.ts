import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_UA_REGEX = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|mobile/gi;

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = MOBILE_UA_REGEX.test(userAgent);

  // Exclude static assets and API routes from redirection
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rewrite if m.localhost (subdomain approach)
  if (host === 'm.localhost:3000') {
    const newURL = request.nextUrl.clone();
    newURL.pathname = '/m' + newURL.pathname;
    return NextResponse.rewrite(newURL);
  }

  // If on mobile and not already in /m
  if (isMobile && !pathname.startsWith('/m')) {
    const url = request.nextUrl.clone();
    url.pathname = `/m${pathname}`;
    return NextResponse.redirect(url);
  }

  // If not on mobile and in /m as a standalone segment (not as part of a filename)
  if (
    !isMobile &&
    (
      pathname === '/m' ||
      pathname.startsWith('/m/')
    )
  ) {
    const url = request.nextUrl.clone();
    // Remove only the first /m segment
    url.pathname = pathname.replace(/^\/m(\/|$)/, '/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}