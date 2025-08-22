// templates/ModernStartup.tsx
"use client";

import Link from "next/link";

interface TemplateProps {
  siteData: {
    businessName?: string;
    description?: string;
    logo?: string;
    [key: string]: any;
  };
}

export default function ModernStartup({ siteData }: TemplateProps) {
  const { businessName = "My Business", description = "Welcome to our website!", logo } = siteData || {};

  return (
    <div className="font-sans">
      <header className="bg-[#f8fafc] p-6 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{businessName}</h1>
          <nav className="space-x-4">
            <Link href="#about">About</Link>
            <Link href="#services">Services</Link>
            <Link href="#contact">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="bg-[#e0f2fe] py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">{siteData.tagline || "tagline"}</h2>
        <p className="max-w-2xl mx-auto text-gray-700">{description}</p>
      </section>

      <section id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-4">Our Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {(siteData.services || ["Custom Development", "E-commerce Setup", "Brand Consulting"]).map((service: string, i: number) => (
              <div key={i} className="p-6 border rounded-xl shadow hover:shadow-lg transition">
                <h4 className="text-lg font-bold mb-2">{service}</h4>
                <p className="text-sm text-gray-600">High-quality service tailored to your needs.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#f1f5f9] py-16 text-center">
        <h3 className="text-2xl font-bold mb-4">About Us</h3>
        <p className="max-w-3xl mx-auto text-gray-700">{description}</p>
      </section>

      <section id="contact" className="py-16 bg-white">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
          <p>Email: {siteData.email || "support@webownr.com"}</p>
          <p>Phone: {siteData.phone || "+234XXXXXXXXXX"}</p>
        </div>
      </section>

      <footer className="bg-[#f8fafc] py-6 text-center text-gray-500">
        &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
      </footer>
    </div>
  );
}
