// templates/elegantBrand.tsx
"use client";

import Link from "next/link";

export default function ElegantBrand({ data }: { data: any }) {
  return (
    <div className="font-serif">
      <header className="bg-white shadow-md p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800">{data.businessName}</h1>
          <nav className="space-x-4 text-gray-600">
            <Link href="#about">About</Link>
            <Link href="#services">Services</Link>
            <Link href="#work">Work</Link>
            <Link href="#contact">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gray-100 py-28 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.tagline}</h2>
        <p className="max-w-2xl mx-auto text-gray-600">{data.about}</p>
      </section>

      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-10 text-gray-800">My Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {(data.services || ["Brand Identity", "Website Design", "Social Media Kit"]).map((service: string, i: number) => (
              <div key={i} className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
                <h4 className="text-xl font-bold text-gray-700 mb-2">{service}</h4>
                <p className="text-gray-500">Tailored to reflect your personality and engage your audience.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="py-20 bg-gray-50 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">Portfolio</h3>
        <p className="text-gray-600 mb-10">Some recent works I’m proud of</p>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-52 bg-gray-300 rounded-lg"></div>
          <div className="h-52 bg-gray-300 rounded-lg"></div>
          <div className="h-52 bg-gray-300 rounded-lg"></div>
          <div className="h-52 bg-gray-300 rounded-lg"></div>
        </div>
      </section>

      <section id="about" className="py-16 bg-white text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">About Me</h3>
        <p className="max-w-2xl mx-auto text-gray-600">{data.about}</p>
      </section>

      <section id="contact" className="bg-gray-900 text-white py-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
        <p>Email: {data?.email ?? "hello@webownr.com"}</p>
        <p>Phone: {data?.phone ?? "+234XXXXXXXXXX"}</p>
      </section>

      <footer className="bg-gray-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} {data?.businessName ?? "My Business"}. Made with elegance by WebOwnr.
      </footer>
    </div>
  );
}
