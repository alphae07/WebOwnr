// templates/ModernStartup.tsx
"use client";

import Link from "next/link";

interface TemplateProps {
  data: {
    businessName?: string;
    description?: string;
    logo?: string;
    [key: string]: any;
  };
}

export default function ModernStartup({ data }: TemplateProps) {
  const { businessName = data?.businessName ?? "My Business", description = data?.description ?? "Welcome to our website!", logo } = data ?? {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
      {logo && <img src={logo} alt={businessName} className="w-24 h-24 mb-4 rounded-full" />}
      <h1 className="text-4xl font-bold">{businessName}</h1>
      <p className="mt-2 text-lg">{description}</p>
    </div>
  );
}
