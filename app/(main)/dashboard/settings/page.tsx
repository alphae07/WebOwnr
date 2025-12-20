"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/MediaLibraryModal";
import {
  User,
  Store,
  Globe,
  Palette,
  CreditCard,
  Bell,
  Shield,
  Camera,
  Loader2,
  Upload,
  Check,
  X,
  Smartphone,
  Layout,
  Image,
  Save,
  Edit2,
  Trash2
} from "lucide-react";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, updatePassword, updateProfile, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, increment } from "firebase/firestore";

// Types
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  birthday: string;
  photoURL: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface SiteData {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  whatsapp: string;
  phone: string;
  category: string;
  template: string;
  plan: string;
  logo: string;
  coverImage: string;
  themeColor: string;
  fontFamily: string;
  darkMode: boolean;
  domain: string;
  customDomain: string;
  paymentMethods: PaymentMethod[];
  storageUsed: number;
  storageLimit: number;
}

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  folder: string;
  createdAt: any;
}

interface NotificationSettings {
  orderNotifications: boolean;
  whatsappAlerts: boolean;
  emailUpdates: boolean;
  lowStockAlerts: boolean;
  marketingTips: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data States
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sex: "",
    birthday: "",
    photoURL: "",
  });

  const [siteData, setSiteData] = useState<SiteData>({
    id: "",
    name: "",
    description: "",
    contactEmail: "",
    whatsapp: "",
    phone: "",
    category: "retail",
    template: "modern",
    plan: "free",
    logo: "",
    coverImage: "",
    themeColor: "#00BCD4",
    fontFamily: "Inter",
    darkMode: false,
    domain: "",
    customDomain: "",
    paymentMethods: [],
    storageUsed: 0,
    storageLimit: 104857600, // 100MB
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderNotifications: true,
    whatsappAlerts: true,
    emailUpdates: false,
    lowStockAlerts: true,
    marketingTips: false,
  });

  // Security State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // UI States
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentMethod | null>(null);
  const [mediaUploadType, setMediaUploadType] = useState<"logo" | "cover" | "profile" | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const fetchMediaFiles = async (siteId: string) => {
    try {
      const mediaRef = collection(db, "media");
      const q = query(mediaRef, where("siteId", "==", siteId));
      const snapshot = await getDocs(q);
      const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MediaItem[];
      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const applyImage = async (url: string, type: "profile" | "logo" | "cover") => {
    if (!user) return;

    if (type === "profile") {
      await updateProfile(user, { photoURL: url });
      setUserData(prev => ({ ...prev, photoURL: url }));
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
    } else if (type === "logo") {
      setSiteData(prev => ({ ...prev, logo: url }));
      if (siteData.id) {
        await updateDoc(doc(db, "sites", siteData.id), { logo: url });
      }
    } else if (type === "cover") {
      setSiteData(prev => ({ ...prev, coverImage: url }));
      if (siteData.id) {
        await updateDoc(doc(db, "sites", siteData.id), { coverImage: url });
      }
    }
  };

  const handleSelectFromMedia = () => {
    if (!selectedMediaId) return;

    const selectedMedia = mediaFiles.find(m => m.id === selectedMediaId);
    if (!selectedMedia || !mediaUploadType) return;

    applyImage(selectedMedia.url, mediaUploadType);
    setShowMediaLibrary(false);
    setSelectedMediaId(null);
    showMessage("success", "Image selected successfully");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      await fetchData(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async (currentUser: FirebaseUser) => {
    try {
      // Fetch User Data from Firestore (if extended profile exists)
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData({
          firstName: data.firstName || currentUser.displayName?.split(" ")[0] || "",
          lastName: data.lastName || currentUser.displayName?.split(" ")[1] || "",
          email: currentUser.email || "",
          phone: data.phone || "",
          sex: data.sex || "",
          birthday: data.birthday || "",
          photoURL: currentUser.photoURL || data.photoURL || "",
        });
        
        if (data.notifications) {
          setNotificationSettings(data.notifications);
        }
      } else {
        // Initialize with Auth data
        setUserData({
          firstName: currentUser.displayName?.split(" ")[0] || "",
          lastName: currentUser.displayName?.split(" ")[1] || "",
          email: currentUser.email || "",
          phone: "",
          sex: "",
          birthday: "",
          photoURL: currentUser.photoURL || "",
        });
      }

      // Fetch Site Data
      const sitesQuery = query(collection(db, "sites"), where("uid", "==", currentUser.uid));
      const sitesSnapshot = await getDocs(sitesQuery);
      
      if (!sitesSnapshot.empty) {
        const siteDoc = sitesSnapshot.docs[0];
        const data = siteDoc.data();
        setSiteData({
          id: siteDoc.id,
          name: data.name || "",
          description: data.description || "",
          contactEmail: data.contactEmail || "",
          whatsapp: data.whatsapp || "",
          phone: data.phone || "",
          category: data.category || "retail",
          template: data.template || "modern",
          plan: data.plan || "free",
          logo: data.logo || "",
          coverImage: data.coverImage || "",
          themeColor: data.themeColor || "#00BCD4",
          fontFamily: data.fontFamily || "Inter",
          darkMode: data.darkMode || false,
          domain: data.domain || `${data.subdomain}.webownr.com`,
          customDomain: data.customDomain || "",
          paymentMethods: data.paymentMethods || [],
          storageUsed: data.storageUsed || 0,
          storageLimit: data.storageLimit || 104857600, // 100MB
        });
        
        // Fetch media files
        await fetchMediaFiles(siteDoc.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = async (file: File, type: "profile" | "logo" | "cover") => {
    if (!user || !siteData.id) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      showMessage("error", `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    // Check storage limit
    if (siteData.storageUsed + file.size > siteData.storageLimit) {
      showMessage("error", `Upload exceeds storage limit. ${formatFileSize(siteData.storageLimit - siteData.storageUsed)} remaining.`);
      return;
    }

    try {
      setUploading(type);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", type === "profile" ? "profiles" : "branding");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const url = data.url;

      // Save to media collection
      await addDoc(collection(db, "media"), {
        siteId: siteData.id,
        name: file.name,
        url: url,
        publicId: data.publicId,
        size: file.size,
        folder: type === "profile" ? "profiles" : "branding",
        createdAt: serverTimestamp(),
      });

      // Update storage usage
      const siteRef = doc(db, "sites", siteData.id);
      await updateDoc(siteRef, {
        storageUsed: increment(file.size),
      });

      // Update local state
      setSiteData({
        ...siteData,
        storageUsed: siteData.storageUsed + file.size,
      });

      // Apply image
      await applyImage(url, type);

      // Refresh media
      await fetchMediaFiles(siteData.id);

      showMessage("success", "Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", "Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`.trim()
      });
      
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        updatedAt: new Date()
      }, { merge: true });
      
      showMessage("success", "Profile updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      showMessage("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStore = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (siteData.id) {
        await updateDoc(doc(db, "sites", siteData.id), {
          ...siteData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, "sites"), {
          ...siteData,
          uid: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSiteData(prev => ({ ...prev, id: docRef.id }));
      }
      showMessage("success", "Store settings updated");
    } catch (error) {
      console.error("Save error:", error);
      showMessage("error", "Failed to update store settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        notifications: notificationSettings
      }, { merge: true });
      showMessage("success", "Notification preferences saved");
    } catch (error) {
      showMessage("error", "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || passwords.new !== passwords.confirm) {
      showMessage("error", "Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await updatePassword(user, passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      showMessage("success", "Password updated successfully");
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newPlan = "installment";
      setSiteData(prev => ({ ...prev, plan: newPlan }));
      
      if (siteData.id) {
        await updateDoc(doc(db, "sites", siteData.id), {
          plan: newPlan,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, "sites"), {
          ...siteData,
          plan: newPlan,
          uid: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSiteData(prev => ({ ...prev, id: docRef.id }));
      }
      showMessage("success", "Plan upgraded to Installment Plan");
    } catch (error) {
      console.error("Upgrade error:", error);
      showMessage("error", "Failed to upgrade plan");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentForm(false);
    showMessage("success", "Payment method added successfully");
  };

  const handleDeleteCard = (id: string) => {
    // In a real app, this would call an API to remove the payment method
    setSiteData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }));
    showMessage("success", "Payment method removed");
  };

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "store", label: "Store", icon: Store },
    { id: "domain", label: "Domain", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {message && (
            <div className={cn(
              "fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 text-white animate-in slide-in-from-right",
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            )}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Tabs */}
            <div className="lg:w-56 shrink-0">
              <div className="bg-card rounded-2xl border border-border p-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 space-y-6">
              
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                        {userData.photoURL ? (
                          <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {userData.firstName?.[0]}{userData.lastName?.[0]}
                          </span>
                        )}
                        {uploading === "profile" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setMediaUploadType("profile");
                          setShowMediaLibrary(true);
                        }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary border border-border rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Profile Photo</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 5MB</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                        <input
                          type="text"
                          value={userData.firstName}
                          onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                        <input
                          type="text"
                          value={userData.lastName}
                          onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                     <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Sex</label>
                        <select
                          value={userData.sex}
                          onChange={(e) => setUserData({...userData, sex: e.target.value})}
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Birthday</label>
                        <input
                          type="date"
                          value={userData.birthday}
                          onChange={(e) => setUserData({...userData, birthday: e.target.value})}
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full px-4 py-2.5 bg-muted/50 border-0 rounded-xl text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                   
                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                      Save Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* STORE TAB */}
              {activeTab === "store" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Store Settings</h2>
                  
                  {/* Store Images */}
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                     {/* Logo */}
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Store Logo</label>
                        <div 
                          className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                          onClick={() => {
                            setMediaUploadType("logo");
                            setShowMediaLibrary(true);
                          }}
                        >
                          {siteData.logo ? (
                            <img src={siteData.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">Select Logo</span>
                            </div>
                          )}
                          {uploading === "logo" && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                     </div>

                     {/* Cover */}
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
                        <div 
                          className="w-full h-32 bg-muted rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                          onClick={() => {
                            setMediaUploadType("cover");
                            setShowMediaLibrary(true);
                          }}
                        >
                          {siteData.coverImage ? (
                            <img src={siteData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Image className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">Select Cover</span>
                            </div>
                          )}
                           {uploading === "cover" && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                     </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Store Name</label>
                      <input
                        type="text"
                        value={siteData.name}
                        onChange={(e) => setSiteData({...siteData, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone Call Number</label>
                        <input
                          type="tel"
                          value={siteData.phone}
                          onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                          placeholder="+1 234 567 890"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">WhatsApp Number</label>
                        <input
                          type="tel"
                          value={siteData.whatsapp}
                          onChange={(e) => setSiteData({...siteData, whatsapp: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Enable WhatsApp order notifications</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <textarea
                        value={siteData.description}
                        onChange={(e) => setSiteData({...siteData, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={siteData.contactEmail}
                        onChange={(e) => setSiteData({...siteData, contactEmail: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                            <select
                                value={siteData.category}
                                onChange={(e) => setSiteData({...siteData, category: e.target.value})}
                                className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="retail">Retail</option>
                                <option value="food">Food & Beverage</option>
                                <option value="services">Services</option>
                                <option value="digital">Digital Products</option>
                                <option value="fashion">Fashion</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Template</label>
                            <select
                                value={siteData.template}
                                onChange={(e) => setSiteData({...siteData, template: e.target.value})}
                                className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="modern">Modern</option>
                                <option value="classic">Classic</option>
                                <option value="minimal">Minimal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>

                     {/* Plan Display */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-foreground">Current Plan: {siteData.plan.toUpperCase()}</p>
                            {(siteData.plan === "free" || siteData.plan === "trial") && (
                                <p className="text-sm text-muted-foreground">Upgrade to unlock more features</p>
                            )}
                        </div>
                        {(siteData.plan === "free" || siteData.plan === "trial") && (
                            <Button size="sm">Upgrade Plan</Button>
                        )}
                    </div>

                    <Button onClick={handleSaveStore} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Store Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* DOMAIN TAB */}
              {activeTab === "domain" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Domain Settings</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-medium text-foreground mb-1">Current Domain</p>
                      <p className="text-primary font-mono">{siteData.domain}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Custom Domain</label>
                      <input
                        type="text"
                        value={siteData.customDomain}
                        onChange={(e) => setSiteData({...siteData, customDomain: e.target.value})}
                        placeholder="www.yourdomain.com"
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Point your domain's A record to our servers to connect it.
                      </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1" onClick={handleSaveStore}>Connect Custom Domain</Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">Buy Domain</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Theme Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                            type="color" 
                            value={siteData.themeColor}
                            onChange={(e) => setSiteData({...siteData, themeColor: e.target.value})}
                            className="w-12 h-12 p-0 border-0 rounded-xl overflow-hidden cursor-pointer"
                        />
                        <div className="flex gap-2">
                          {["#00BCD4", "#FF6B6B", "#9B59B6", "#F4A261", "#2ECC71"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setSiteData({...siteData, themeColor: color})}
                              className="w-8 h-8 rounded-full border border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Font Family</label>
                        <select
                            value={siteData.fontFamily}
                            onChange={(e) => setSiteData({...siteData, fontFamily: e.target.value})}
                            className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Dark Mode</label>
                      <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSiteData({...siteData, darkMode: false})}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                !siteData.darkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                        >
                            Light
                        </button>
                        <button 
                            onClick={() => setSiteData({...siteData, darkMode: true})}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                siteData.darkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                        >
                            Dark
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleSaveStore} disabled={saving}>Save Appearance</Button>
                  </div>
                </div>
              )}

              {/* BILLING TAB */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-semibold text-foreground">{siteData.plan === 'installment' ? 'Installment Plan' : 'Standard Plan'}</p>
                        <p className="text-sm text-muted-foreground">{siteData.plan === 'installment' ? '$29/month' : 'Free Tier'}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">Active</span>
                    </div>
                    
                    {/* Ownership Progress (Installment Only) */}
                    {siteData.plan === 'installment' && (
                        <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Ownership Progress</span>
                            <span className="text-sm font-medium text-primary">67%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">4 payments left to own your website forever!</p>
                        </div>
                    )}

                     <div className="mt-4 flex gap-4">
                         <Button variant="outline">View Invoices</Button>
                         <Button>Upgrade Plan</Button>
                     </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
                    
                    {!showPaymentForm ? (
                        <>
                            {siteData.paymentMethods.length > 0 ? (
                              <div className="space-y-3 mb-4">
                                {siteData.paymentMethods.map((method) => (
                                  <div key={method.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                                    <div className="w-12 h-8 bg-gradient-to-r from-indigo to-purple rounded flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">{method.brand}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">•••• •••• •••• {method.last4}</p>
                                      <p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => {
                                        setEditingCard(method);
                                        setShowPaymentForm(true);
                                      }}>
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(method.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center p-6 border-2 border-dashed border-muted rounded-xl mb-4">
                                <p className="text-muted-foreground">No payment methods added</p>
                              </div>
                            )}
                            
                            <Button variant="outline" className="w-full" onClick={() => {
                              setEditingCard(null);
                              setShowPaymentForm(true);
                            }}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Add New Payment Method
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleSavePaymentMethod} className="space-y-4 animate-in slide-in-from-top-2">
                            <h3 className="font-medium mb-4">{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                                <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    defaultValue={editingCard ? `•••• •••• •••• ${editingCard.last4}` : ""}
                                    className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Expiry</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        defaultValue={editingCard?.expiry || ""}
                                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">CVC</label>
                                    <input 
                                        type="text" 
                                        placeholder="123"
                                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button type="submit" className="flex-1">Save Card</Button>
                                <Button type="button" variant="ghost" onClick={() => {
                                  setShowPaymentForm(false);
                                  setEditingCard(null);
                                }}>Cancel</Button>
                            </div>
                        </form>
                    )}
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: "orderNotifications", label: "Order Notifications", description: "Get notified when you receive a new order" },
                      { key: "whatsappAlerts", label: "WhatsApp Alerts", description: "Receive order alerts via WhatsApp" },
                      { key: "emailUpdates", label: "Email Updates", description: "Weekly summary of your store performance" },
                      { key: "lowStockAlerts", label: "Low Stock Alerts", description: "Get notified when products are running low" },
                      { key: "marketingTips", label: "Marketing Tips", description: "Receive tips to grow your business" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof NotificationSettings] }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            notificationSettings[item.key as keyof NotificationSettings] ? "bg-primary" : "bg-border"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                              notificationSettings[item.key as keyof NotificationSettings] ? "translate-x-7" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                    <Button onClick={handleSaveNotifications} disabled={saving} className="mt-4">
                         Save Preferences
                    </Button>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={saving || !passwords.new}>
                        {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <MediaLibraryModal 
          isOpen={showMediaLibrary} 
          onClose={() => { 
            setShowMediaLibrary(false); 
            setSelectedMediaId(null); 
          }} 
          mediaFiles={mediaFiles} 
          onSelect={() => handleSelectFromMedia()} 
          onUpload={(file) => handleFileUpload(file, mediaUploadType as "profile" | "logo" | "cover")} 
          uploadType={mediaUploadType || "image"} 
          uploading={uploading === mediaUploadType}
          selectedId={selectedMediaId}
          onSelectionChange={setSelectedMediaId}
        />
      </main>
    </DashboardLayout>
  );
};

export default SettingsPage;

