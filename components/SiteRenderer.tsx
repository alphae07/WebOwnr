// components/SiteRenderer.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { templates } from "@/lib/templateConfig";

export type TemplateKey = "modernStartup" | "simpleBusiness" | "elegantBrand";

export type SiteContent = {
  businessName?: string;
  tagline?: string;
  about?: string;
  services?: string[];
  color?: string;
  logoUrl?: string;
  niche?: string;
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

export default function SiteRenderer({ siteSlug }: { siteSlug: string }) {
  const [docData, setDocData] = useState<SiteDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!siteSlug) { setMissing(true); return; }
        const ref = doc(db, "sites", siteSlug);
        const snap = await getDoc(ref);
        if (!mounted) return;
        if (!snap.exists()) { setMissing(true); return; }

        const raw = snap.data() as SiteDoc & { id?: string };
        // avoid “id specified more than once”
        const { id: _ignore, ...payload } = raw;
        setDocData({ ...payload, id: snap.id });
      } catch (e) {
        console.error("Failed to load site:", e);
        setMissing(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [siteSlug]);

  if (loading) return <div className="p-8 text-center">Loading site…</div>;
  if (missing || !docData)
    return <div className="p-8 text-center text-red-600">Site not found for: <b>{siteSlug}</b></div>;

  const templateKey: TemplateKey =
    docData.template && templates[docData.template] ? docData.template : "modernStartup";
  const TemplateComp = templates[templateKey].component as TemplateComponent;

  // Prefer published, then draft, then legacy root fields (backward compat)
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

  return <TemplateComp data={content} />;
}
