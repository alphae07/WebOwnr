// app/[site]/page.tsx
import { getSiteData } from "@/lib/getSiteData";
import SiteRenderer from "@/components/SiteRenderer";

interface SitePageProps {
  params: { site: string };
}

export default async function SitePage({ params }: SitePageProps) {
  const siteData = await getSiteData(params.site);

  if (!siteData) {
    return <div className="flex h-screen items-center justify-center">
      <h1 className="text-xl font-bold">Site not found</h1>
    </div>;
  }

  return <SiteRenderer siteData={siteData} />;
}
