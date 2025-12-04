// app/(sites)/[site]/[...catchall]/page.tsx
import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";
import { SiteData } from "@/lib/data";
import { ReactNode } from "react";

// Dynamic route parameters
interface PageParams {
  site: string;
  catchall?: string[];
}

// Async server component page
export default async function Page({
  params,
}: {
  params: PageParams;
}): Promise<ReactNode> {
  const { site, catchall } = params;

  const siteData: SiteData | null = await getSiteBySlug(site);

  const path = catchall?.join("/") || "home";

  return renderSite(siteData, path);
}
