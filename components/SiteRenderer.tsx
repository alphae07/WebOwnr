"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { templates } from "@/lib/templateConfig";

export type SiteData = {
  id?: string;
  subdomain?: string;
  businessName?: string;
  tagline?: string;
  about?: string;
  niche?: string;
  color?: string;
  logoUrl?: string;
  template?: "modernStartup" | "simpleBusiness" | "elegantBrand";
  services?: string[];
  status?: "pending" | "live" | "maintenance";
};



export default function SiteRenderer({ siteSlug }: { siteSlug: string }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!siteSlug) {
          setMissing(true);
          return;
        }
        // Firestore: sites/{subdomain}
        const ref = doc(db, "sites", siteSlug);
        const snap = await getDoc(ref);

        if (!mounted) return;

        if (!snap.exists()) {
          setMissing(true);
          return;
        }
        const payload = snap.data() as SiteData;
        setData({ id: snap.id, ...payload });
      } catch (e) {
        console.error("Failed to load site:", e);
        setMissing(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [siteSlug]);

  if (loading) {
    return <div className="p-8 text-center">Loading site…</div>;
  }
  if (missing || !data) {
    return (
      <div className="p-8 text-center text-red-600">
        Site not found for: <b>{siteSlug}</b>
      </div>
    );
  }

  // pick template (fallback to modernStartup)
  const templateKey =
    data.template && templates[data.template] ? data.template : "modernStartup";

  const TemplateComp = templates[templateKey].component;

  // All templates receive a uniform `data` prop
  return <TemplateComp data={data} />;
}
