// app/[site]/page.tsx
import type { Metadata } from "next";
import SiteRenderer from "@/components/SiteRenderer";

// NOTE: Next.js 15 generated types expect `params` to be a Promise in .next/types
type ParamsPromise = Promise<{ site: string }>;

export async function generateMetadata(
  props: { params: ParamsPromise }
): Promise<Metadata> {
  const { site } = await props.params;
  return {
    title: `${site} — WebOwnr`,
    description: `Live site for ${site} on WebOwnr.`,
  };
}

export default async function SitePage(props: { params: ParamsPromise }) {
  const { site } = await props.params;
  // We do client-side Firestore fetching inside SiteRenderer for simplicity
  return <SiteRenderer siteSlug={site} />;
}
