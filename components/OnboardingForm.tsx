// components/OnboardingForm.tsx
"use client";

import { useState } from "react";
import { templates } from "@/lib/templateConfig";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import TemplatePicker from "./TemplatePicker";

const plansWithChoice = ["growth", "pro"]; // User plan that can choose template

export default function OnboardingForm({
  userId,
  plan,
  
}: {
  userId: string;
  plan: string;
}) {
  const [form, setForm] = useState({
    businessName: "",
    niche: "",
    subdomain: "",
    template: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTemplateSelect = (id: string) =>
    setForm({ ...form, template: id });

  const [selectedTemplate, setSelectedTemplate] = useState("");
const isPremium = plan === "premium" || plan === "growth";

  const getRandomTemplateBasedOnNiche = (niche: string) => {
    const mapping: Record<string, string> = {
      ecommerce: "modern",
      service: "classic",
      creator: "bold",
      general: "minimal",
    };
    return mapping[niche.toLowerCase()] || "minimal";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedTemplate =
      plansWithChoice.includes(plan) && form.template
        ? form.template
        : getRandomTemplateBasedOnNiche(form.niche);

    await setDoc(doc(db, "sites", form.subdomain), {
      ...form,
      template: selectedTemplate,
      userId,
      status: "setup_pending",
      createdAt: Date.now(),
    });

    setLoading(false);
    alert("Website setup in progress. It’ll go live shortly.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="businessName"
        placeholder="Business Name"
        className="w-full border p-2 rounded"
        value={form.businessName}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="niche"
        placeholder="Niche (e.g. service, ecommerce)"
        className="w-full border p-2 rounded"
        value={form.niche}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="subdomain"
        placeholder="Subdomain (e.g. mybiz)"
        className="w-full border p-2 rounded"
        value={form.subdomain}
        onChange={handleChange}
        required
      />

      {plansWithChoice.includes(plan) && (
        <div>
          <h3 className="font-semibold mb-2">Choose a Template</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(templates).map(([key, tpl]) => (
              <div
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className={`border rounded-xl p-3 cursor-pointer ${
                  form.template === key ? "border-blue-600" : "border-gray-300"
                }`}
              >
              {isPremium ? (
              <TemplatePicker
                selected={selectedTemplate}
                setSelected={setSelectedTemplate}
              />
            ) : (
              <p className="text-gray-600 italic text-sm">
                A template will be assigned automatically based on your niche.
              </p>
            )}
                <h4 className="font-bold text-sm mb-2">{tpl.name}</h4>
                <tpl.component
                  data={{ businessName: form.businessName || "Your Brand" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Setting up..." : "Create Website"}
      </button>
    </form>
  );
}
