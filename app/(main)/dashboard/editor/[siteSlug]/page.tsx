// app/dashboard/editor/[siteSlug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import type { SiteContent, SiteDoc } from "@/components/SiteRenderer";
import Link from "next/link";

interface EditorPageProps {
  params: {
    siteSlug: string;
  };
}
export default function EditorPage({ params }: { params: Record<string, string> }) {
  const { siteSlug } = params;


  const { siteSlug } = params;

  const [site, setSite] = useState<SiteDoc | null>(null);
  const [form, setForm] = useState<SiteContent>({
    businessName: "",
    tagline: "",
    about: "",
    services: [],
    color: "",
    logoUrl: "",
    niche: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle" | "draft" | "publish">("idle");

  useEffect(() => {
    (async () => {
      const ref = doc(db, "sites", siteSlug);
      const snap = await getDoc(ref);
      if (!snap.exists()) { setLoading(false); return; }

      const data = snap.data() as SiteDoc;
      setSite({ ...data, id: snap.id, subdomain: data.subdomain ?? siteSlug });

      const initial: SiteContent =
        data.draftContent ??
        data.publishedContent ?? {
          businessName: (data as any).businessName ?? "",
          tagline: (data as any).tagline ?? "",
          about: (data as any).about ?? "",
          services: (data as any).services ?? [],
          color: (data as any).color ?? "",
          logoUrl: (data as any).logoUrl ?? "",
          niche: (data as any).niche ?? "",
        };

      setForm(initial);
      setLoading(false);
    })();
  }, [siteSlug]);

  async function saveDraft() {
    setSaving("draft");
    const ref = doc(db, "sites", siteSlug);
    await setDoc(ref, { draftContent: form, updatedAt: Date.now() }, { merge: true });
    setSaving("idle");
  }

  async function publish() {
    setSaving("publish");
    const ref = doc(db, "sites", siteSlug);
    await setDoc(
      ref,
      { draftContent: form, publishedContent: form, updatedAt: Date.now() },
      { merge: true }
    );
    setSaving("idle");
  }

  if (loading) return <div className="p-6">Loading editor…</div>;
  if (!site) return <div className="p-6 text-red-600">Site not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit: {siteSlug}</h1>
        <div className="space-x-2">
          <a className="px-3 py-2 rounded bg-gray-200" href={`https://${siteSlug}.webownr.com`} target="_blank" rel="noreferrer">View Live</a>
          <Link className="px-3 py-2 rounded bg-gray-100" href="/dashboard">Back to Dashboard</Link>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <div className="mb-1 font-medium">Business Name</div>
          <input
            className="w-full p-2 border rounded"
            value={form.businessName ?? ""}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Tagline</div>
          <input
            className="w-full p-2 border rounded"
            value={form.tagline ?? ""}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">About</div>
          <textarea
            className="w-full p-2 border rounded"
            rows={5}
            value={form.about ?? ""}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Primary Color</div>
          <input
            className="w-full p-2 border rounded"
            placeholder="#00bcd4 or tailwind color"
            value={form.color ?? ""}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Logo URL</div>
          <input
            className="w-full p-2 border rounded"
            value={form.logoUrl ?? ""}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Services (comma separated)</div>
          <input
            className="w-full p-2 border rounded"
            value={(form.services ?? []).join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                services: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={saveDraft} disabled={saving !== "idle"} className="px-4 py-2 rounded bg-gray-200">
          {saving === "draft" ? "Saving…" : "Save Draft"}
        </button>
        <button onClick={publish} disabled={saving !== "idle"} className="px-4 py-2 rounded bg-cyan-600 text-white">
          {saving === "publish" ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
