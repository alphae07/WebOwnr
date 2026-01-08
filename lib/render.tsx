// lib/renderSite.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { ReactNode } from "react";
import SiteRenderer from "@/components/SiteRenderer";
import { SiteData, PageData } from "@/lib/data";

/**
 * Render a site given a SiteData object and a page path
 * @param site The site data
 * @param path The page path (e.g., "home", "about")
 * @returns ReactNode for rendering
 */
export function renderSite(site: SiteData | null, path: string): ReactNode {
  if (!site)  return (
   <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>

      </div>
    </div>);

  const page: PageData | undefined = site.pages[path] ?? site.pages["home"];

  if (!page) return (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>

      </div>
    </div>);

  const safe = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
  return <SiteRenderer sitee={safe(site)} page={safe(page)} />;
}
 