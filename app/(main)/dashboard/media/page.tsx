"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  Grid,
  List,
  Search,
  Folder,
  Trash2,
  Download,
  Copy,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface MediaFile {
  id: string;
  siteId: string;
  name: string;
  url: string;
  publicId: string;
  size: number;
  folder: string;
  createdAt: any;
}

interface SiteData {
  id: string;
  uid: string;
  storageUsed: number;
  storageLimit: number;
  [key: string]: any;
}

const Media = () => {
  const router = useRouter();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const folders = [
    { id: "all", name: "All Files" },
    { id: "products", name: "Products" },
    { id: "banners", name: "Banners" },
    { id: "logos", name: "Logos" },
    { id: "others", name: "Others" },
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

  // Auth and data fetching
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
          storageLimit: userSite.data().storageLimit || 100 * 1024 * 1024, // 100MB default
          ...userSite.data(),
        } as SiteData;
        setSiteData(siteInfo);

        await fetchMedia(userSite.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch media files
  const fetchMedia = async (siteId: string) => {
    try {
      const mediaRef = collection(db, "media");
      const q = query(mediaRef, where("siteId", "==", siteId));
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Calculate storage usage percentage
  const storagePercentage = siteData
    ? (siteData.storageUsed / siteData.storageLimit) * 100
    : 0;

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !siteData) return;

    // Calculate total size
    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );

    // Check if upload exceeds storage limit
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

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", selectedFolder === "all" ? "others" : selectedFolder);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

	if (!data.url || !data.publicId) {
  console.error("Upload response:", data);
  throw new Error("Upload failed: missing publicId");
}

        // Save to Firebase
        await addDoc(collection(db, "media"), {
          siteId: siteData.id,
          name: file.name,
          url: data.url,
          publicId: data.publicId,
          size: file.size,
          folder: selectedFolder === "all" ? "others" : selectedFolder,
          createdAt: serverTimestamp(),
        });

        return file.size;
      });

      const sizes = await Promise.all(uploadPromises);
      const totalUploadedSize = sizes.reduce((sum, size) => sum + size, 0);

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

      await fetchMedia(siteData.id);

      // Reset input
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload some files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file delete
  const handleDelete = async (file: MediaFile) => {
    if (!window.confirm(`Delete "${file.name}"?`)) return;

    setDeleting(file.id);
    try {
      // Delete from Cloudinary
      const response = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: file.publicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete from Cloudinary");
      }

      // Delete from Firebase
      await deleteDoc(doc(db, "media", file.id));

      // Update storage usage
      if (siteData) {
        const siteRef = doc(db, "sites", siteData.id);
        await updateDoc(siteRef, {
          storageUsed: increment(-file.size),
        });

        setSiteData({
          ...siteData,
          storageUsed: Math.max(0, siteData.storageUsed - file.size),
        });
      }

      await fetchMedia(siteData!.id);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  // Download file
  const downloadFile = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter files
  const filteredFiles = mediaFiles.filter((file) => {
    const matchesFolder =
      selectedFolder === "all" || file.folder === selectedFolder;
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // Get folder counts
  const getFolderCount = (folderId: string) => {
    if (folderId === "all") return mediaFiles.length;
    return mediaFiles.filter((f) => f.folder === folderId).length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading media...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Folders Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-medium text-foreground mb-4">Folders</h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                      selectedFolder === folder.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="flex-1 text-sm">{folder.name}</span>
                    <span className="text-xs opacity-70">
                      {getFolderCount(folder.id)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Storage Info */}
              <div className="mt-6 p-4 bg-muted rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Storage
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(siteData?.storageUsed || 0)} /{" "}
                    {formatFileSize(siteData?.storageLimit || 0)}
                  </span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      storagePercentage >= 90
                        ? "bg-destructive"
                        : storagePercentage >= 75
                        ? "bg-warning"
                        : "bg-primary"
                    )}
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  />
                </div>
                {storagePercentage >= 90 && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Storage almost full. Upgrade for more space.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Files Grid */}
          <div className="flex-1 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  )}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <label
              className={cn(
                "border-2 border-dashed border-border rounded-2xl p-8 text-center bg-card transition-colors cursor-pointer block",
                uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-primary/50"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div
                className={cn(
                  "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4",
                  uploading && "animate-pulse"
                )}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-primary" />
                )}
              </div>
              <p className="font-medium text-foreground mb-1">
                {uploading ? "Uploading..." : "Drop files here to upload"}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploading
                  ? "Please wait..."
                  : `or click to browse (max ${formatFileSize(
                      MAX_FILE_SIZE
                    )} per file)`}
              </p>
            </label>

            {/* Files */}
            {filteredFiles.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No files found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Upload your first file to get started"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="p-2 bg-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file.url, file.name)}
                          className="p-2 bg-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          disabled={deleting === file.id}
                          className="p-2 bg-background rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                        Size
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                        Folder
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-foreground">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">
                          {file.folder}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(file.url)}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadFile(file.url, file.name)}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(file)}
                              disabled={deleting === file.id}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Media;