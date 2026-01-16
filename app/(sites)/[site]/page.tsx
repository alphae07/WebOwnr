// app/(sites)/[site]/page.tsx
import type { Metadata } from "next";
import SiteRenderer from "@/components/SiteRenderer";
import { getSiteData, getPageData } from "@/lib/data"; 

import Link from "next/link";
import { Button } from "@/components/ui/button";
// NOTE: params is a Promise in Next.js 15
type ParamsPromise = Promise<{ site: string }>;

// Generate dynamic metadata
export async function generateMetadata(
  props: { params: ParamsPromise }
): Promise<Metadata> {
  const { site } = await props.params;

  return {
    title: `${site}`,
    description: `Live site for ${site} on WebOwnr.`,
  };
}

// Main page render
export default async function SitePage(props: { params: ParamsPromise }) {
  const { site } = await props.params; // ✅ Await params here

  console.log("🔍 Route param site:", site);

  const siteData = await getSiteData(site);
  console.log("🔥 Firestore result:", siteData);
  
  if (!siteData) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Store not found
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>

          <Link href="/signup">
            <Button variant="outline">
              Create Store
            </Button>
          </Link>
        </div>

      </div>
    </div>
    );
  }

  const pageData = await getPageData(siteData, "home");

  const safe = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
  return <SiteRenderer sitee={safe(siteData)} page={safe(pageData)} />;
}
