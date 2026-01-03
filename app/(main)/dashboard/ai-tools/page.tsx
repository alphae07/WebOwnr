"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

interface UserCredits {
  available: number;
  used: number;
  limit: number;
  plan: string;
  nextReset: string;
}

interface GenerationHistory {
  id: string;
  tool: string;
  input: string;
  output: string;
  creditsUsed: number;
  timestamp: any;
}

const AITools = () => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [credits, setCredits] = useState<UserCredits>({
    available: 0,
    used: 0,
    limit: 20,
    plan: "free",
    nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  const [selectedTool, setSelectedTool] = useState("description");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: "description",
      name: "Product Description",
      description: "Generate compelling product descriptions",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600",
      placeholder: "Enter product name and key features...",
      credits: 2,
    },
    {
      id: "seo",
      name: "SEO Optimizer",
      description: "Optimize titles and meta descriptions",
      icon: Search,
      color: "bg-emerald-500/10 text-emerald-600",
      placeholder: "Enter your page title or content...",
      credits: 3,
    },
    {
      id: "social",
      name: "Social Captions",
      description: "Create engaging social media posts",
      icon: MessageSquare,
      color: "bg-orange-500/10 text-orange-600",
      placeholder: "Describe what you want to promote...",
      credits: 2,
    },
    {
      id: "brand",
      name: "Brand Voice",
      description: "Develop consistent brand messaging",
      icon: Palette,
      color: "bg-purple-500/10 text-purple-600",
      placeholder: "Describe your brand personality...",
      credits: 4,
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      await fetchUserCredits(currentUser.uid);
      await fetchHistory(currentUser.uid);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUserCredits = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCredits({
          available: data.credits?.available || 20,
          used: data.credits?.used || 0,
          limit: data.credits?.limit || 20,
          plan: data.plan || "free",
          nextReset: data.credits?.nextReset || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      showMessage("error", "Failed to load credits");
    }
  };

  const fetchHistory = async (userId: string) => {
    try {
      const q = query(collection(db, "ai-generations"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GenerationHistory[];
      setHistory(historyData.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20));
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleGenerate = async () => {
    if (!user || !input.trim()) {
      showMessage("error", "Please enter some input");
      return;
    }

    const currentTool = tools.find(t => t.id === selectedTool);
    if (!currentTool) return;

    if (credits.available < currentTool.credits) {
      showMessage("error", `Insufficient credits. You need ${currentTool.credits} credits but only have ${credits.available}`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          tool: selectedTool,
          input: input,
          creditsNeeded: currentTool.credits,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Generation failed");
      }

      const data = await response.json();
      setOutput(data.output);
      
      // Update credits
      setCredits(prev => ({
        ...prev,
        available: prev.available - currentTool.credits,
        used: prev.used + currentTool.credits,
      }));

      // Add to history
      const newHistoryItem: GenerationHistory = {
        id: data.generationId || Date.now().toString(),
        tool: selectedTool,
        input,
        output: data.output,
        creditsUsed: currentTool.credits,
        timestamp: new Date(),
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));

      showMessage("success", "Content generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      showMessage("error", error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTool = tools.find(t => t.id === selectedTool)!;
  const creditPercentage = (credits.available / credits.limit) * 100;
  const isLowOnCredits = credits.available < 5;

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Bar with Credits */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">WebOwnr AI</h1>
              <p className="text-muted-foreground mt-1">Generate content with AI-powered tools</p>
            </div>
            <div className="w-full sm:w-auto bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Credits Available</span>
                <span className={cn("text-lg font-bold", isLowOnCredits ? "text-red-600" : "text-primary")}>
                  {credits.available}/{credits.limit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all rounded-full",
                    isLowOnCredits ? "bg-red-600" : "bg-gradient-to-r from-blue-600 to-purple-600"
                  )}
                  style={{ width: `${Math.max(creditPercentage, 5)}%` }}
                />
              </div>
              {isLowOnCredits && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Running low on credits
                </p>
              )}
            </div>
          </div>

          {message && (
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top",
              message.type === "success"
                ? "bg-green-500/10 text-green-700 border border-green-200"
                : "bg-red-500/10 text-red-700 border border-red-200"
            )}>
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Tool Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-left group",
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
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <Zap className="w-3 h-3" />
                  {tool.credits} credits
                </div>
              </button>
            ))}
          </div>

          {/* Main Workspace */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Editor */}
            <div className="lg:col-span-2 space-y-4">
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

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Input</label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={currentTool.placeholder}
                      className="w-full h-40 p-4 bg-muted rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("")}
                      className="gap-2"
                      disabled={!input.trim() || isGenerating}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating || !input.trim() || credits.available < currentTool.credits}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate ({currentTool.credits} credits)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Output */}
              {output && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">Output</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-2 h-8"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - History & Tips */}
            <div className="space-y-4">
              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-primary/10 to-purple/10 rounded-2xl p-4 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Be Specific:</strong> Include details for better results</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Iterate:</strong> Regenerate with tweaked inputs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Mix & Match:</strong> Combine outputs from different tools</span>
                  </li>
                </ul>
              </div>

              {/* History */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recent
                  </h3>
                  {history.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {history.length}
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {history.length > 0 ? (
                    <div className="divide-y divide-border">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedTool(item.tool);
                            setInput(item.input);
                            setOutput(item.output);
                          }}
                          className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-xs font-medium text-foreground truncate">
                            {tools.find(t => t.id === item.tool)?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{item.input}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span className="text-muted-foreground">{item.creditsUsed} credits</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No history yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Generated content will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default AITools;