// app/(sites)/[site]/page.tsx
import type { Metadata } from "next";
import SiteRenderer from "@/components/SiteRenderer";

// NOTE: Next.js 15 generated types expect `params` to be a Promise in .next/types
type ParamsPromise = Promise<{ site: string }>;

// Generate dynamic metadata per subdomain
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
  const { site } = await props.params;

  // SiteRenderer handles client-side Firestore fetching
  return <SiteRenderer siteSlug={site} />;
}
