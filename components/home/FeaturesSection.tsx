"use client";

import { 
  CreditCard, 
  Smartphone, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  Shield,
  Zap,
  Palette
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "Choose subscription or installment plans. Build now, pay monthly, and own your website forever.",
      highlight: true,
    },
    {
      icon: Sparkles,
      title: "AI-Assisted Setup",
      description: "Let AI help write product descriptions, optimize images, and suggest layouts for your store.",
      highlight: false,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Notifications",
      description: "Get instant order alerts on WhatsApp. Never miss a sale with real-time notifications.",
      highlight: false,
    },
    {
      icon: Smartphone,
      title: "PWA Mobile App",
      description: "Convert your store to a Progressive Web App. Your customers can install it like a native app.",
      highlight: false,
    },
    {
      icon: Globe,
      title: "Custom Domain",
      description: "Use your own domain or get a free your-brand.webownr.com subdomain instantly.",
      highlight: false,
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "SSL certificates, automated backups, and 99.9% uptime guarantee for your peace of mind.",
      highlight: false,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with global CDN. Your store loads in under 2 seconds worldwide.",
      highlight: false,
    },
    {
      icon: Palette,
      title: "Beautiful Templates",
      description: "Choose from dozens of professionally designed templates. Customize colors, fonts, and layouts.",
      highlight: false,
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Sell Online
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed specifically for small businesses. No technical skills required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                feature.highlight
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card border border-border shadow-card hover:shadow-lg"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.highlight
                    ? "bg-primary-foreground/20"
                    : "bg-accent"
                }`}
              >
                <feature.icon
                  className={`w-6 h-6 ${
                    feature.highlight ? "text-primary-foreground" : "text-primary"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  feature.highlight ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`text-sm ${
                  feature.highlight
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
