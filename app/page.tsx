// app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="text-2xl font-bold text-cyan-600">WebOwnr</h1>
        <nav className="space-x-6">
          <Link href="/auth" className="text-gray-600 hover:text-cyan-600">
            Login
          </Link>
          <Link href="/register">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 max-w-2xl leading-tight">
          Create Your Website <span className="text-cyan-600">Effortlessly</span>
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-xl">
          WebOwnr helps you launch a professional website instantly.
          Choose a design, pick a domain, and go live in minutes —
          no coding required.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/register">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 text-lg rounded-xl shadow">
              Start Free
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline" className="px-6 py-3 text-lg rounded-xl">
              Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 px-8 py-16 max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl shadow bg-white hover:shadow-lg transition">
          <h3 className="font-semibold text-xl text-cyan-600">Instant Setup</h3>
          <p className="text-gray-600 mt-2">
            Get your website live in seconds with auto-generated templates and domains.
          </p>
        </div>
        <div className="p-6 rounded-2xl shadow bg-white hover:shadow-lg transition">
          <h3 className="font-semibold text-xl text-cyan-600">Custom Branding</h3>
          <p className="text-gray-600 mt-2">
            Upload your logo, choose your brand colors, and personalize your site instantly.
          </p>
        </div>
        <div className="p-6 rounded-2xl shadow bg-white hover:shadow-lg transition">
          <h3 className="font-semibold text-xl text-cyan-600">Easy Management</h3>
          <p className="text-gray-600 mt-2">
            Manage your content, domains, and subscriptions easily from your dashboard.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} WebOwnr. All rights reserved.
      </footer>
    </div>
  );
}
