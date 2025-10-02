// app/(sites)/[site]/page.tsx
import type { Metadata } from "next";
import SiteRenderer from "@/components/SiteRenderer";
import { getSiteData, getPageData } from "@/lib/data"; 

// NOTE: params is a Promise in Next.js 15
type ParamsPromise = Promise<{ site: string }>;

// Generate dynamic metadata
export async function generateMetadata(
  props: { params: ParamsPromise }
): Promise<Metadata> {
  const { site } = await props.params;

  return {
    title: `${site} — WebOwnr`,
    description: `Live site for ${site} on WebOwnr.`,
  };
}

// Main page render
export default async function SitePage(props: { params: ParamsPromise }) {
  const { site } = await props.params; // ✅ Await params here

  console.log("🔍 Route param site:", site);

  const siteData = await getSiteData(site);
  console.log("🔥 Firestore result:", siteData);
  
  if (!siteData) {
    return <div>Site not found</div>;
  }

  const pageData = await getPageData(siteData, "home");

  return <SiteRenderer sitee={siteData} page={pageData} />;
}
