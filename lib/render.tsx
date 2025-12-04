// lib/renderSite.tsx
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
  if (!site) return <div>Site not found!</div>;

  const page: PageData | undefined = site.pages[path] ?? site.pages["home"];

  if (!page) return <div>Page not found!</div>;

  // Pass site and page to SiteRenderer component
  return <SiteRenderer sitee={site} page={page} />;
}
