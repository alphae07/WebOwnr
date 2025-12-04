import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

export default async function Page({
  params,
}: {
  params: { site: string; catchall?: string[] };
}) {
  const site = await getSiteBySlug(params.site);

  if (!site) return <div>Site not found</div>;

  const path = params.catchall?.join("/") || "home";

  return renderSite(site, path);
}
