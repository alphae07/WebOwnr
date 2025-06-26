import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl;

  const isLocalhost = host.includes('localhost');
  const domainParts = host.split('.');

  let subdomain = '';

  if (isLocalhost) {
    subdomain = domainParts[0]; // e.g. freshbeans.lvh.me:3000 → freshbeans
  } else {
    subdomain = domainParts[0]; // e.g. freshbeans.webownr.com
  }

  // 🛑 Skip if this is not a subdomain
  const baseHosts = ['localhost', 'lvh', 'www', 'webownr'];
  if (baseHosts.includes(subdomain)) {
    return NextResponse.next(); // Show landing page or dashboard
  }

  // ✅ Rewrite to /site/[subdomain]
  const newUrl = new URL(`/site/${subdomain}`, req.url);
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'],
};
