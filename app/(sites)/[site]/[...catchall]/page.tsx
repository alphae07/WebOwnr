// app/(sites)/[site]/[...catchall]/page.tsx
import { getSiteBySlug } from "@/lib/getSiteData"; // keep in lib
import { renderSite } from "@/lib/render";
import { ReactNode } from "react";

// Define the shape of your dynamic route parameters
type SitePageParams = {
  site: string;
  catchall?: string[];
};

// Define the props Next.js passes to the page
interface PageProps {
  params: SitePageParams;
}

export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { site, catchall } = params;

  // Fetch site data using helper from lib
  const siteData = await getSiteBySlug(site);

  if (!siteData) {
    return <div>Site not found</div>;
  }

  // Compute path from catchall
  const path = catchall?.join("/") || "home";

  // Render the site
  return renderSite(siteData, path);
}
