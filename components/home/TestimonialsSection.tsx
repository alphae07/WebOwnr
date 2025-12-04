"use client";

import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, StyleBoutique",
      avatar: "SC",
      content: "WebOwnr made it so easy to launch my online store. The installment plan was perfect for my budget, and now I own my website!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Founder, TechGear Pro",
      avatar: "MJ",
      content: "The WhatsApp notifications are a game-changer. I never miss an order, and my customers love the instant updates.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "CEO, Artisan Crafts",
      avatar: "ER",
      content: "From zero technical knowledge to a fully functional store in one afternoon. The AI assistant helped me write all my product descriptions!",
      rating: 5,
    },
    {
      name: "David Kimani",
      role: "Owner, LocalFresh Market",
      avatar: "DK",
      content: "The PWA feature let my customers install my store like an app. My repeat purchases increased by 40% in the first month.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "Founder, EcoHome",
      avatar: "LT",
      content: "Best decision I made for my small business. The templates are beautiful, and the support team is incredibly helpful.",
      rating: 5,
    },
    {
      name: "James Okonkwo",
      role: "Owner, AfriCraft Store",
      avatar: "JO",
      content: "Being able to own my website after the installment payments was the deciding factor. No more endless monthly fees!",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
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
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-warning fill-warning"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {testimonial.avatar}
                  </span>
                </div>
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
          {[
            { value: "2,000+", label: "Active Stores" },
            { value: "98%", label: "Customer Satisfaction" },
            { value: "$2M+", label: "Sales Processed" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
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
