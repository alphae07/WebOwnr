import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

export default async function Page({ params }) {
  const { site, catchall } = params;

  const siteData = await getSiteBySlug(site);
  if (!siteData) return <div>Site not found</div>;

  const path = catchall?.join("/") || "home";
  return renderSite(siteData, path);
}
