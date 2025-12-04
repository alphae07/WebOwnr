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
  // The Next.js PageProps constraint requires `searchParams` to be present in the component props type.
  // The original definition was missing this property, which caused the type incompatibility error.
  // We destructure it here to satisfy the constraint, even if it's unused.
  searchParams,
}: {
  params: PageParams;
  // Next.js page components require searchParams in props, even if unused in the function body
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<ReactNode> {
  const { site, catchall } = params;

  const siteData: SiteData | null = await getSiteBySlug(site);

  const path = catchall?.join("/") || "home";

  return renderSite(siteData, path);
}
