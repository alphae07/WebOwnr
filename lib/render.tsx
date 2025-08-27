import React from "react";
import SiteRenderer from "@/components/SiteRenderer";
import { SiteData } from "@/lib/data";

export function renderSite(site: SiteData, path: string) {
  const page = site.pages[path] ?? site.pages["home"];
  return <SiteRenderer site={site} page={page} />;
}
