// app/(sites)/[site]/[...catchall]/page.tsx
import { getSiteBySlug } from "@/lib/getSiteData";
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

// Define the type of your site data (adjust according to your getSiteBySlug return)
interface Site {
  id: string;
  slug: string;
  name: string;
  content: any; // Adjust based on your site's content structure
}

// Fully typed getSiteBySlug (example)
export async function getSiteBySlugTyped(slug: string): Promise<Site | null> {
  const site = await getSiteBySlug(slug);
  return site ?? null;
}

// The Page component itself
export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { site, catchall } = params;

  // Fetch site data
  const siteData = await getSiteBySlugTyped(site);

  if (!siteData) {
    return <div>Site not found</div>;
  }

  // Compute path from catchall
  const path = catchall?.join("/") || "home";

  // Render the site
  return renderSite(siteData, path);
}
