// components/MediaLibraryModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Check, Upload, Loader2, ImagePlus } from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  folder: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaFiles: MediaFile[];
  onSelect: (mediaId: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploadType: string;
  uploading?: boolean;
  selectedId?: string | null;
  onSelectionChange?: (id: string | null) => void;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  mediaFiles,
  onSelect,
  onUpload,
  uploadType,
  uploading = false,
  selectedId: controlledSelectedId,
  onSelectionChange,
}: MediaLibraryModalProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const handleSelection = (id: string) => {
    if (onSelectionChange) {
      onSelectionChange(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Choose Image for {uploadType}
          </h2>
          <button
            onClick={onClose}
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
                No images in library yet
              </p>
              <p className="text-sm text-muted-foreground">
                Upload your first image below
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleSelection(file.id)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedId === file.id
                      ? "border-primary shadow-lg"
                      : "border-transparent hover:border-muted"
                  )}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedId === file.id && (
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

        <div className="p-6 border-t border-border space-y-4">
          {/* Upload New */}
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <div
              className={cn(
                "w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors",
                uploading
                  ? "border-muted cursor-not-allowed"
                  : "border-border hover:border-primary hover:bg-primary/5"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Upload New Image
                  </span>
                </>
              )}
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedId ? "1 image selected" : "No image selected"}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedId && onSelect(selectedId)}
                disabled={!selectedId}
              >
                Select Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}