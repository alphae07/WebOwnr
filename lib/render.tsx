// lib/renderSite.tsx
import React, { JSX } from "react";
import SiteRenderer from "@/components/SiteRenderer";
import { SiteData, PageData } from "@/lib/data";

export function renderSite(slug: string) {
//export function renderSite(site: SiteData, path: string): JSX.Element {
  //const page: PageData = site.pages[path] ?? site.pages["home"];
  //return <SiteRenderer site={site} page={page} />;
  return <SiteRenderer siteSlug={slug} />;
}
