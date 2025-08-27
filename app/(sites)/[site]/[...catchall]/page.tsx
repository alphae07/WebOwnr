import { getSiteBySlug } from "@/lib/getSiteData";
import { renderSite } from "@/lib/render";

type PageProps = {
  params: {
    site: string;
    catchAll?: string[];
  };
};

export default async function Page({ params }: PageProps) {
  const site = await getSiteBySlug(params.site);
  if (!site) return <div>Site not found</div>;

  const path = params.catchAll?.join("/") || "home";
  return renderSite(site, path);
}
