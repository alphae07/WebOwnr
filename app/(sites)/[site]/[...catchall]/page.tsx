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
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<ReactNode> {
  // Await the params promise
  const { site, catchall } = await params;
  
  const siteData: SiteData | null = await getSiteBySlug(site);
  const path = catchall?.join("/") || "home";
  
  return renderSite(siteData, path);
}
