"use client";

import { templates } from "@/lib/templateConfig";
import { getSiteData } from "@/lib/getSiteData";
import { notFound } from "next/navigation";

interface SitePageProps {
  params: {
    site: string;
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const site = await getSiteData(params.site);

  if (!site) return notFound();

  const Template = templates[site.template as keyof typeof templates]?.component || templates.simpleBusiness.component;

  
  return <Template site={site} />;
}
