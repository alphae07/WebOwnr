// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // Localhost handling (e.g. alpha.localhost:3000)
  const isLocalhost = host.includes("localhost");

  let subdomain = "";
  if (isLocalhost) {
    // remove :3000 first
    const parts = host.replace(":3000", "").split(".");
    if (parts.length > 1) {
      subdomain = parts[0]; // "alpha"
    }
  } else {
    // production: something.webownr.com
    const parts = host.split(".");
    if (parts.length > 2) {
      subdomain = parts[0]; // "alpha"
    }
  }

  // Skip main domain (www / root domain)
  if (subdomain && subdomain !== "www" && subdomain !== "webownr") {
    // Rewrite /about -> /alpha/about
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next.js internal routes
     */
    "/((?!_next|favicon.ico|api).*)",
  ],
};
