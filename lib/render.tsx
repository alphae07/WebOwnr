// lib/renderSite.tsx
import React, { JSX } from "react";
import SiteRenderer from "@/components/SiteRenderer";
import { SiteData, PageData } from "@/lib/data";



export function renderSite(site: SiteData, path: string) {
  const page: PageData = site?.pages[path] ?? site?.pages["home"];
  if (!site) return  <div>Site not found!</div>;
  return <SiteRenderer sitee={site} page={page} />;
}