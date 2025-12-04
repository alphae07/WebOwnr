import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

type SitePageParams = {
  site: string;
  catchall?: string[];
};

interface PageProps {
  params: SitePageParams;
}

export default async function Page({ params }: PageProps) {
  const { site, catchall } = params;
  const siteData = await getSiteBySlug(site);

  if (!siteData) return <div>Site not found</div>;

  const path = catchall?.join("/") || "home";

  return renderSite(siteData, path);
}
