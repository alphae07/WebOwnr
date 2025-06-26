import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl;

  // Handle localhost (for dev): localhost:3000
  const isLocalhost = host.includes('localhost');
  const domainParts = host.split('.');

  let subdomain = '';

  if (isLocalhost) {
    // e.g. subdomain.localhost:3000
    subdomain = domainParts[0];
  } else {
    // e.g. freshbeans.webownr.com → subdomain = freshbeans
    subdomain = domainParts[0];
  }

  // If subdomain is www or main domain, continue normally
  if (subdomain === 'www' || subdomain === 'webownr') {
    return NextResponse.next();
  }

  // Rewrite request to dynamic route
  const newUrl = new URL(`/site/${subdomain}`, req.url);
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'],
};
