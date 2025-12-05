"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { auth, db, storage } from "@/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Store,
  Shirt,
  Coffee,
  Laptop,
  Palette,
  Flower2,
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

const Onboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    template: "",
    brandName: "",
    logo: null as File | null,
    colorTheme: "",
    paymentModel: "",
  });

  const totalSteps = 5;

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding-draft");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({
          ...parsed,
          logo: null, // Don't restore file object
        });
      } catch (e) {
        console.error("Failed to restore draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    const { logo, ...dataToSave } = formData;
    localStorage.setItem("onboarding-draft", JSON.stringify(dataToSave));
  }, [formData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed() && !isLoading) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, formData, isLoading]);

  // Generate valid subdomain
  const generateSubdomain = (brandName: string) => {
    return brandName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50); // Limit length
  };

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "sites", subdomain);
      const docSnap = await getDoc(docRef);
      return !docSnap.exists();
    } catch (error) {
      console.error("Error checking subdomain:", error);
      return false;
    }
  };

  const saveOnboardingData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    let logoUrl = "";

    // Upload logo if exists
    if (formData.logo) {
      const storageRef = ref(storage, `logos/${user.uid}-${Date.now()}.png`);
      await uploadBytes(storageRef, formData.logo);
      logoUrl = await getDownloadURL(storageRef);
    }

    const subdomain = generateSubdomain(formData.brandName);

    // Check if subdomain is available
    const isAvailable = await checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      throw new Error("This store name is already taken. Please choose another name.");
    }

    await setDoc(doc(db, "sites", subdomain), {
      uid: user.uid,
      brandName: formData.brandName,
      template: formData.template,
      colorTheme: formData.colorTheme,
      paymentModel: formData.paymentModel,
      logoUrl,
      subdomain: `${subdomain}.webownr.com`,
      createdAt: new Date().toISOString(),
    });

    // Clear draft after successful save
    localStorage.removeItem("onboarding-draft");
  };

  const templates = [
    { id: "fashion", name: "Fashion & Apparel", icon: Shirt, color: "bg-pink-100 text-pink-600" },
    { id: "food", name: "Food & Beverages", icon: Coffee, color: "bg-amber-100 text-amber-600" },
    { id: "electronics", name: "Electronics", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { id: "art", name: "Art & Crafts", icon: Palette, color: "bg-purple-100 text-purple-600" },
    { id: "beauty", name: "Beauty & Wellness", icon: Flower2, color: "bg-green-100 text-green-600" },
    { id: "general", name: "General Store", icon: Store, color: "bg-cyan-100 text-cyan-600" },
  ];

  const colorThemes = [
    { id: "cyan", name: "Ocean", colors: ["#00BCD4", "#00838F", "#E0F7FA"] },
    { id: "purple", name: "Royal", colors: ["#9C27B0", "#6A1B9A", "#F3E5F5"] },
    { id: "green", name: "Nature", colors: ["#4CAF50", "#2E7D32", "#E8F5E9"] },
    { id: "orange", name: "Sunset", colors: ["#FF9800", "#EF6C00", "#FFF3E0"] },
    { id: "pink", name: "Blossom", colors: ["#E91E63", "#C2185B", "#FCE4EC"] },
    { id: "blue", name: "Trust", colors: ["#2196F3", "#1565C0", "#E3F2FD"] },
  ];

  const paymentModels = [
    {
      id: "subscription",
      name: "Subscription",
      icon: CreditCard,
      description: "Pay monthly, cancel anytime",
      price: "$19-99/mo",
      benefits: ["Flexible monthly payments", "Cancel anytime", "All features included"],
    },
    {
      id: "installment",
      name: "Installment",
      icon: Wallet,
      description: "Pay to own your website",
      price: "$199-699 × 12",
      benefits: ["Own your website forever", "No more fees after 12 months", "1 year free hosting included"],
    },
  ];

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError("");
    } else {
      setIsLoading(true);
      setError("");
      try {
        await saveOnboardingData();
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create your store. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: null });
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview("");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.template !== "";
      case 2:
        return formData.brandName.trim() !== "" && formData.brandName.length >= 2;
      case 3:
        return formData.colorTheme !== "";
      case 4:
        return formData.paymentModel !== "";
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose your template</h2>
              <p className="text-muted-foreground">
                Pick a template that best fits your business type
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, template: template.id })}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg text-center",
                    formData.template === template.id
                      ? "border-primary bg-accent shadow-glow"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                  aria-label={`Select ${template.name} template`}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4",
                      template.color
                    )}
                  >
                    <template.icon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-foreground">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your brand details</h2>
              <p className="text-muted-foreground">Tell us about your business</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand name *</Label>
                <Input
                  id="brandName"
                  placeholder="My Awesome Store"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="h-12"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Your store URL:{" "}
                  {formData.brandName
                    ? generateSubdomain(formData.brandName)
                    : "your-store"}
                  .webownr.com
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Logo (optional)</Label>
                {!logoPreview ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("logoUpload")?.click()}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">Drag or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
                    <input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-border rounded-xl p-4 relative">
                    <button
                      onClick={removeLogo}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      aria-label="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain mx-auto"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {formData.logo?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Pick your colors</h2>
              <p className="text-muted-foreground">
                Choose a color theme that matches your brand
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, colorTheme: theme.id })}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg",
                    formData.colorTheme === theme.id
                      ? "border-primary shadow-glow"
                      : "border-border hover:border-primary/50"
                  )}
                  aria-label={`Select ${theme.name} color theme`}
                >
                  <div className="flex gap-1 mb-3 justify-center">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose your plan</h2>
              <p className="text-muted-foreground">
                Select how you want to pay for your website
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {paymentModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setFormData({ ...formData, paymentModel: model.id })}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg",
                    formData.paymentModel === model.id
                      ? "border-primary bg-accent shadow-glow"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                  aria-label={`Select ${model.name} payment plan`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <model.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-4">{model.price}</p>
                  <ul className="space-y-2">
                    {model.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
              <p className="text-muted-foreground">
                Review your choices and start building your store
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Template</span>
                <span className="font-medium text-foreground capitalize">
                  {templates.find((t) => t.id === formData.template)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Brand name</span>
                <span className="font-medium text-foreground">{formData.brandName}</span>
              </div>
              {logoPreview && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Logo</span>
                  <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain" />
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Color theme</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground capitalize">
                    {colorThemes.find((t) => t.id === formData.colorTheme)?.name}
                  </span>
                  <div className="flex gap-0.5">
                    {colorThemes
                      .find((t) => t.id === formData.colorTheme)
                      ?.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Payment plan</span>
                <span className="font-medium text-foreground capitalize">
                  {paymentModels.find((p) => p.id === formData.paymentModel)?.name}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Progress Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="font-bold text-lg text-foreground">WebOwnr</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-destructive hover:text-destructive/80"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="animate-fade-up">{renderStep()}</div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="hero"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {currentStep === totalSteps ? "Launch My Store" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;