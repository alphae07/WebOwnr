// app/(sites)/[site]/[...catchall]/page.tsx
import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

interface RouteParams {
  site: string;
  catchall?: string[];
}

export default async function Page({
  params,
}: {
  params: RouteParams;
}) {
  const { site, catchall } = params;

  const siteData = await getSiteBySlug(site);
  if (!siteData) return <div>Site not found</div>;

  const path = catchall?.join("/") || "home";

  return renderSite(siteData, path);
}
