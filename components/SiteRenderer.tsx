"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { fetchSite } from "@/lib/data";
import { templates } from "@/lib/templateConfig";
import { SiteData, PageData } from "@/lib/data";

export type TemplateKey = "modern" | "classic" | "minimal" | "bold";

export type SiteContent = {
  businessName?: string;
  tagline?: string;
  about?: string;
  services?: string[];
  color?: string;
  logoUrl?: string;
  niche?: string;
  subdomain?: string;
  siteId?: string;
};

export type SiteDoc = {
  id?: string;
  subdomain: string;
  template?: TemplateKey;
  publishedContent?: SiteContent;
  draftContent?: SiteContent;
  uid?: string;
  status?: "live" | "pending" | "maintenance";
};

type TemplateComponent = React.ComponentType<{ data: SiteContent }>;

export default function SiteRenderer({
  sitee,
  page,
}: {
  sitee: SiteData;
  page: PageData;
}) {
  const [docData, setDocData] = useState<SiteDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
        if (!sitee) {
          setMissing(true);
          return;
        }
        const result = await fetchSite(sitee.subdomain);
    if (mounted) {
      if (result) {
        setDocData(result as SiteDoc);
      } else {
        setMissing(true);
      }
      setLoading(false);
    }
  })();
  return () => {
    mounted = false;
  };
}, [sitee]);


  if (loading) return <div className="p-8 text-center">Loading site…</div>;
  if (missing || !docData )
    return (
      <div className="p-8 text-center text-red-600">
        Site not found
      </div>
    );

  const templateKey: TemplateKey =
    docData.template && templates[docData.template]
      ? docData.template
      : "modern";
  const TemplateComp = templates[templateKey].component as TemplateComponent;

  const content: SiteContent =
    docData.publishedContent ??
    docData.draftContent ?? {
      businessName: (docData as any).businessName,
      tagline: (docData as any).tagline,
      about: (docData as any).about,
      services: (docData as any).services,
      color: (docData as any).color,
      logoUrl: (docData as any).logoUrl,
      niche: (docData as any).niche,
    };

  content.subdomain = docData.subdomain;
  (content as any).siteId = (docData as any).id;
  return <TemplateComp data={content} />;
}
