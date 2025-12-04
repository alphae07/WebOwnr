// app/(sites)/[site]/[...catchall]/page.tsx
import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

export default async function Page({ params }: { params: { site: string; catchall?: string[] } }) {
  const { site, catchall } = params;
  const siteData = await getSiteBySlug(site);

  if (!siteData) return <div>Site not found</div>;

  return renderSite(siteData, catchall?.join("/") || "home");
}
