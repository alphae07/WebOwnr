"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  Image,
  Sparkles,
  Smartphone,
  Bell,
  LogOut,
  Menu,
  X,
  Wand2,
  FileText,
  MessageSquare,
  Search,
  Palette,
  Zap,
  Copy,
  RotateCcw,
  Send,
} from "lucide-react";

const AITools = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState("description");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "Products", href: "/dashboard/products" },
    { icon: Package, label: "Orders", href: "/dashboard/orders", badge: 3 },
    { icon: Image, label: "Media", href: "/dashboard/media" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Sparkles, label: "AI Tools", href: "/dashboard/ai-tools", active: true },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const tools = [
    {
      id: "description",
      name: "Product Description",
      description: "Generate compelling product descriptions",
      icon: FileText,
      color: "bg-primary/10 text-primary",
      placeholder: "Enter product name and key features...",
    },
    {
      id: "seo",
      name: "SEO Optimizer",
      description: "Optimize titles and meta descriptions",
      icon: Search,
      color: "bg-teal-light text-teal",
      placeholder: "Enter your page title or content...",
    },
    {
      id: "social",
      name: "Social Captions",
      description: "Create engaging social media posts",
      icon: MessageSquare,
      color: "bg-coral-light text-coral",
      placeholder: "Describe what you want to promote...",
    },
    {
      id: "brand",
      name: "Brand Voice",
      description: "Develop consistent brand messaging",
      icon: Palette,
      color: "bg-purple-light text-purple",
      placeholder: "Describe your brand personality...",
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const sampleOutputs: Record<string, string> = {
        description: `✨ Introducing the ${input || "Premium Product"}\n\nExperience luxury redefined with our meticulously crafted product. Designed for the modern lifestyle, it combines elegance with functionality.\n\n🌟 Key Features:\n• Premium quality materials\n• Sleek, contemporary design\n• Built to last\n• Perfect for everyday use\n\n💫 Why You'll Love It:\nThis isn't just a product—it's a statement. Whether you're gifting it to someone special or treating yourself, you're investing in quality that speaks volumes.\n\n🛒 Order now and elevate your experience!`,
        seo: `📊 SEO Optimized Content\n\nTitle Tag (60 chars):\n"${input || "Your Product"} | Premium Quality | Free Shipping"\n\nMeta Description (155 chars):\n"Discover our ${input || "premium product"} - crafted for excellence. Shop now for exclusive deals, fast shipping & 30-day returns. Transform your experience today!"\n\nKeywords:\n• Primary: ${input || "product name"}\n• Secondary: premium, quality, shop, buy online\n• Long-tail: best ${input || "product"} for [use case]`,
        social: `📱 Social Media Captions\n\n🔥 Instagram:\n"Upgrade your game with our latest drop! ✨ ${input || "Check out this amazing product"} - Link in bio!\n#NewArrival #ShopNow #MustHave"\n\n🐦 Twitter:\n"Big news! 🎉 ${input || "Our newest product"} just landed. Limited stock - grab yours before they're gone! 🛒"\n\n💼 LinkedIn:\n"Excited to announce our latest innovation. ${input || "This product"} represents our commitment to quality and customer satisfaction."`,
        brand: `🎨 Brand Voice Guidelines\n\nBased on your description: "${input || "modern and professional"}"\n\nTone: Confident, Approachable, Premium\n\nVoice Characteristics:\n• Speak with authority but stay friendly\n• Use "we" and "you" to build connection\n• Highlight benefits over features\n• Keep sentences punchy and clear\n\nSample Taglines:\n1. "Crafted for those who demand more"\n2. "Where quality meets innovation"\n3. "Your journey to excellence starts here"\n\nDo's:\n✅ Be authentic and transparent\n✅ Focus on customer benefits\n✅ Use active voice\n\nDon'ts:\n❌ Use jargon or buzzwords\n❌ Be overly salesy\n❌ Make claims you can't back up`,
      };
      setOutput(sampleOutputs[selectedTool] || "Generated content will appear here...");
      setIsGenerating(false);
    }, 1500);
  };

  const currentTool = tools.find((t) => t.id === selectedTool)!;


  return (
    <DashboardLayout>
     <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Tool Selection */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all text-left",
                    selectedTool === tool.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", tool.color)}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-foreground">{tool.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </button>
              ))}
            </div>

            {/* AI Workspace */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", currentTool.color)}>
                    <currentTool.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{currentTool.name}</p>
                    <p className="text-xs text-muted-foreground">{currentTool.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                {/* Input */}
                <div className="p-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Input</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentTool.placeholder}
                    className="w-full h-48 p-4 bg-muted rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("")}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating || !input.trim()}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Output */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-foreground">Output</label>
                    {output && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="gap-2 h-8"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    )}
                  </div>
                  <div className="w-full h-48 p-4 bg-muted rounded-xl overflow-y-auto">
                    {output ? (
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{output}</pre>
                    ) : (
                      <p className="text-muted-foreground text-sm">Generated content will appear here...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-primary/10 via-purple/10 to-coral/10 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Pro Tips
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-card/80 rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm mb-1">Be Specific</p>
                  <p className="text-xs text-muted-foreground">Include key features, target audience, and desired tone for better results.</p>
                </div>
                <div className="bg-card/80 rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm mb-1">Iterate & Refine</p>
                  <p className="text-xs text-muted-foreground">Use the output as a starting point and regenerate with tweaked inputs.</p>
                </div>
                <div className="bg-card/80 rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm mb-1">Mix & Match</p>
                  <p className="text-xs text-muted-foreground">Combine outputs from different tools for comprehensive content.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </DashboardLayout>
  );
};

export default AITools;