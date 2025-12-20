"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft,
  Sparkles,
  X,
  ImagePlus,
  DollarSign,
  Package,
  Tag,
  Loader2,
  Check,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteData {
  id: string;
  uid: string;
  storageUsed: number;
  storageLimit: number;
  [key: string]: any;
}

interface MediaFile {
  id: string;
  siteId: string;
  name: string;
  url: string;
  publicId: string;
  size: number;
  folder: string;
}

const AddProduct = () => {
  const router = useRouter();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    sku: "",
    stock: "",
    category: "",
    tags: "",
    status: "Active",
  });

  const categories = [
    "Fashion",
    "Electronics",
    "Home & Living",
    "Beauty",
    "Accessories",
    "Food & Drinks",
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "sites"));
        const userSite = querySnapshot.docs.find(
          (doc) => doc.data().uid === user.uid
        );

        if (!userSite) {
          router.push("/onboarding");
          return;
        }

        const siteInfo: SiteData = {
          id: userSite.id,
          uid: userSite.data().uid,
          storageUsed: userSite.data().storageUsed || 0,
          storageLimit: userSite.data().storageLimit || 100 * 1024 * 1024,
          ...userSite.data(),
        } as SiteData;
        setSiteData(siteInfo);

        // Fetch media files
        await fetchMediaFiles(userSite.id);
      } catch (error) {
        console.error("Error fetching site data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch media files from products folder
  const fetchMediaFiles = async (siteId: string) => {
    try {
      const mediaRef = collection(db, "media");
      const q = query(
        mediaRef,
        where("siteId", "==", siteId)
      );
      const mediaSnapshot = await getDocs(q);
      const files = mediaSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaFile[];
      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Handle image upload to products folder
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !siteData) return;

    // Calculate total size
    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);

    // Check storage limit
    if (siteData.storageUsed + totalSize > siteData.storageLimit) {
      alert(
        `Upload exceeds your storage limit. You have ${formatFileSize(
          siteData.storageLimit - siteData.storageUsed
        )} remaining.`
      );
      return;
    }

    // Check individual file sizes
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File "${file.name}" is too large. Maximum file size is ${formatFileSize(
            MAX_FILE_SIZE
          )}`
        );
        return;
      }
    }

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();

        // Save to Firebase media collection
        await addDoc(collection(db, "media"), {
          siteId: siteData.id,
          name: file.name,
          url: data.url,
          publicId: data.publicId,
          size: file.size,
          folder: "products",
          createdAt: serverTimestamp(),
        });

        return { url: data.url, size: file.size };
      });

      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map((r) => r.url);
      const totalUploadedSize = results.reduce((sum, r) => sum + r.size, 0);

      // Update storage usage
      const siteRef = doc(db, "sites", siteData.id);
      await updateDoc(siteRef, {
        storageUsed: increment(totalUploadedSize),
      });

      // Update local state
      setSiteData({
        ...siteData,
        storageUsed: siteData.storageUsed + totalUploadedSize,
      });

      setImages([...images, ...uploadedUrls]);
      
      // Refresh media files
      await fetchMediaFiles(siteData.id);

      // Reset input
      e.target.value = "";
    } catch (error: any) {
      console.error("Error uploading images:", error);
      alert(`Failed to upload: ${error.message || "Unknown error"}`);
    } finally {
      setUploadingImages(false);
    }
  };

  // Toggle media selection
  const toggleMediaSelection = (mediaId: string) => {
    const newSelection = new Set(selectedMediaIds);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMediaIds(newSelection);
  };

  // Add selected media to product images
  const addSelectedMedia = () => {
    const selectedMedia = mediaFiles.filter((m) => selectedMediaIds.has(m.id));
    const selectedUrls = selectedMedia.map((m) => m.url);
    setImages([...images, ...selectedUrls]);
    setSelectedMediaIds(new Set());
    setShowMediaPicker(false);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteData) {
      alert("Site data not loaded. Please refresh and try again.");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    setSubmitting(true);

    try {
      // Determine stock status
      const stockNum = parseInt(formData.stock) || 0;
      let status = formData.status;
      if (stockNum === 0) {
        status = "Out of Stock";
      } else if (stockNum > 0 && stockNum <= 10) {
        status = "Low Stock";
      }

      // Create product document
      await addDoc(collection(db, "products"), {
        siteId: siteData.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice
          ? parseFloat(formData.comparePrice)
          : null,
        sku: formData.sku.trim() || null,
        stock: stockNum,
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        status: status,
        image: images[0] || null,
        images: images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
              <p className="text-sm text-muted-foreground">
                Create a new product for your store
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
            </div>
          </div>

          {/* Back Link */}
          <button
            onClick={() => router.push("/dashboard/products")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Summer Floral Dress"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Description
                      </label>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate with AI
                      </button>
                    </div>
                    <textarea
                      placeholder="Describe your product..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">
                    Product Images
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Choose from Media
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-muted rounded-xl overflow-hidden group"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                        <span className="text-xs text-muted-foreground">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Upload New
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Pricing</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Price <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="h-11 pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Compare at Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.comparePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            comparePrice: e.target.value,
                          })
                        }
                        className="h-11 pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Inventory</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      SKU
                    </label>
                    <Input
                      placeholder="e.g., SKU-001"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Stock Quantity
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className="h-11 pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Status</h2>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Category */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </h2>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Tags</h2>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Add tags..."
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="h-11 pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Choose from Media Library
              </h2>
              <button
                onClick={() => {
                  setShowMediaPicker(false);
                  setSelectedMediaIds(new Set());
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <ImagePlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No images in products folder yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload images using the button above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => toggleMediaSelection(file.id)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        selectedMediaIds.has(file.id)
                          ? "border-primary shadow-lg"
                          : "border-transparent hover:border-muted"
                      )}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedMediaIds.has(file.id) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedMediaIds.size} image(s) selected
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMediaPicker(false);
                    setSelectedMediaIds(new Set());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSelectedMedia}
                  disabled={selectedMediaIds.size === 0}
                >
                  Add Selected ({selectedMediaIds.size})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AddProduct;