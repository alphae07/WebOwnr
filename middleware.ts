import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "webownr.com";

  // Skip on localhost and files/api
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }
  if (!host.endsWith(rootDomain)) return NextResponse.next();

  // Extract subdomain (e.g., alpha.webownr.com -> "alpha")
  const subdomain = host.replace(`.${rootDomain}`, "");
  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return NextResponse.next();
  }

  // Rewrite to /[site] route
  return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
}

// Avoid rewriting static assets and API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|.*\\..*).*)"],
};
