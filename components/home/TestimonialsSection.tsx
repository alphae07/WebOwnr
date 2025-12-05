"use client";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@/public/testimonial-1.png";
import testimonial2 from "@/public/testimonial-2.png";
import testimonial3 from "@/public/testimonial-3.png";
import Image from "next/image";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, StyleBoutique",
      image: testimonial1,
      content: "WebOwnr made it so easy to launch my online store. The installment plan was perfect for my budget, and now I own my website!",
      rating: 5,
      accentColor: "from-coral to-coral-dark",
    },
    {
      name: "Marcus Johnson",
      role: "Founder, TechGear Pro",
      image: testimonial2,
      content: "The WhatsApp notifications are a game-changer. I never miss an order, and my customers love the instant updates.",
      rating: 5,
      accentColor: "from-primary to-teal",
    },
    {
      name: "Emily Rodriguez",
      role: "CEO, Artisan Crafts",
      image: testimonial3,
      content: "From zero technical knowledge to a fully functional store in one afternoon. The AI assistant helped me write all my product descriptions!",
      rating: 5,
      accentColor: "from-purple to-indigo",
    },
    {
      name: "David Kimani",
      role: "Owner, LocalFresh Market",
      image: testimonial1,
      content: "The PWA feature let my customers install my store like an app. My repeat purchases increased by 40% in the first month.",
      rating: 5,
      accentColor: "from-teal to-teal-dark",
    },
    {
      name: "Lisa Thompson",
      role: "Founder, EcoHome",
      image: testimonial3,
      content: "Best decision I made for my small business. The templates are beautiful, and the support team is incredibly helpful.",
      rating: 5,
      accentColor: "from-gold to-gold-dark",
    },
    {
      name: "James Okonkwo",
      role: "Owner, AfriCraft Store",
      image: testimonial2,
      content: "Being able to own my website after the installment payments was the deciding factor. No more endless monthly fees!",
      rating: 5,
      accentColor: "from-indigo to-purple",
    },
  ];

  const stats = [
    { value: "2,000+", label: "Active Stores", color: "text-primary" },
    { value: "98%", label: "Customer Satisfaction", color: "text-teal" },
    { value: "$2M+", label: "Sales Processed", color: "text-coral" },
    { value: "4.9/5", label: "Average Rating", color: "text-gold" },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-coral/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-coral/10 to-gold/10 border border-coral/20 rounded-full text-sm font-medium text-coral mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Business Owners
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of entrepreneurs who've built successful online stores with WebOwnr.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Accent gradient bar */}
              <div className={`absolute top-0 left-6 right-6 h-1 bg-gradient-to-r ${testimonial.accentColor} rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity`} />

              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-gold fill-gold"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Image 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
