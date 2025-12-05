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
      gradient: "from-coral to-coral-dark",
      bgLight: "bg-coral-light",
    },
    {
      icon: Sparkles,
      title: "AI-Assisted Setup",
      description: "Let AI help write product descriptions, optimize images, and suggest layouts for your store.",
      gradient: "from-purple to-indigo",
      bgLight: "bg-purple-light",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Notifications",
      description: "Get instant order alerts on WhatsApp. Never miss a sale with real-time notifications.",
      gradient: "from-teal to-teal-dark",
      bgLight: "bg-teal-light",
    },
    {
      icon: Smartphone,
      title: "PWA Mobile App",
      description: "Convert your store to a Progressive Web App. Your customers can install it like a native app.",
      gradient: "from-indigo to-purple",
      bgLight: "bg-indigo-light",
    },
    {
      icon: Globe,
      title: "Custom Domain",
      description: "Use your own domain or get a free your-brand.webownr.com subdomain instantly.",
      gradient: "from-primary to-teal",
      bgLight: "bg-cyan-light",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "SSL certificates, automated backups, and 99.9% uptime guarantee for your peace of mind.",
      gradient: "from-gold to-gold-dark",
      bgLight: "bg-gold-light",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with global CDN. Your store loads in under 2 seconds worldwide.",
      gradient: "from-coral to-gold",
      bgLight: "bg-coral-light",
    },
    {
      icon: Palette,
      title: "Beautiful Templates",
      description: "Choose from dozens of professionally designed templates. Customize colors, fonts, and layouts.",
      gradient: "from-purple to-coral",
      bgLight: "bg-purple-light",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-l from-coral/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-teal/10 to-primary/10 border border-teal/20 rounded-full text-sm font-medium text-teal mb-4">
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
              className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgLight} flex items-center justify-center mb-4 group-hover:bg-primary-foreground/20 transition-colors`}
                >
                  <feature.icon
                    className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent group-hover:text-primary-foreground transition-colors`}
                    style={{ color: `hsl(var(--${feature.gradient.split('-')[1]}))` }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary-foreground transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
