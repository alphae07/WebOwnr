"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // <-- ensure your firebase file is here
import { doc, getDoc } from "firebase/firestore";
import { templatesMap } from "@/lib/templateConfig"; // we created this earlier

type SiteDoc = {
  subdomain: string;
  template?: string;
  status?: "active" | "pending" | "maintenance" | "inactive";
  branding?: { logo?: string; primaryColor?: string };
  content?: Record<string, any>;
  businessName?: string;
  tagline?: string;
};

export default function SiteRenderer({ subdomain }: { subdomain: string }) {
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<SiteDoc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "sites", subdomain);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        setSite(snap.data() as SiteDoc);
      } catch (e) {
        console.error("Failed to fetch site:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading site…</p>
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">404 — Site not found</h1>
      </div>
    );
  }

  if (site.status === "pending" || site.status === "maintenance") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold mb-2">🚧 Setting Things Up</h1>
        <p className="text-gray-600 max-w-md">
          This site is in maintenance mode while content is being prepared.
          Please check back soon.
        </p>
      </div>
    );
  }

  // Pick template; default to "modernStartup"
  const templateId = site.template || "modernStartup";
  const Template = templatesMap[templateId]?.component;

  if (!Template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Template <strong>{templateId}</strong> not found.
        </p>
      </div>
    );
  }

  // Render the chosen template with site data
  return (
    <Template
      branding={site.branding}
      content={site.content}
      businessName={site.businessName}
      tagline={site.tagline}
      subdomain={site.subdomain}
    />
  );
}
