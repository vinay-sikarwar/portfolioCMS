import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Link2,
  X,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { compressAndProcessImage, formatBytes } from "../lib/imageUtils";

interface SingleImageUploaderProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  compact?: boolean;
}

export const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  value,
  onChange,
  label = "Featured Image / Photo",
  helperText = "Upload image or paste image URL. Auto-optimized for instant API loading.",
  className = "",
  compact = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [optimizedMeta, setOptimizedMeta] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WebP, SVG, etc.).");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await compressAndProcessImage(file, 1200, 1200, 0.85);
      onChange(result.dataUrl);
      setOptimizedMeta(
        `${formatBytes(result.compressedSize)} (${result.width}×${result.height})`
      );
    } catch (err: any) {
      console.error("Failed to optimize image:", err);
      alert(err.message || "Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input so the same file can be re-selected if needed
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSaveUrl = () => {
    if (!tempUrl.trim()) return;
    onChange(tempUrl.trim());
    setOptimizedMeta("Direct URL");
    setShowUrlInput(false);
    setTempUrl("");
  };

  const handleRemove = () => {
    onChange("");
    setOptimizedMeta(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#0F241D] flex items-center gap-1.5 uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label}</span>
        </label>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Main Uploader Body */}
      {value ? (
        /* Image Preview Box */
        <div className="relative group rounded-2xl overflow-hidden border border-[#DCE4D8] bg-slate-900 shadow-xs">
          <div
            className={`w-full ${
              compact ? "h-36 sm:h-44" : "h-52 sm:h-64"
            } flex items-center justify-center bg-slate-950/80 overflow-hidden relative`}
          >
            <img
              src={value}
              alt="Uploaded item preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                // Fallback icon on broken URL
                (e.target as HTMLElement).style.display = "none";
              }}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-white transition-all active:scale-95"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Change Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTempUrl(value.startsWith("http") ? value : "");
                  setShowUrlInput(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-white transition-all active:scale-95"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Set URL</span>
              </button>
            </div>
          </div>

          {/* Size / Status Badge */}
          {optimizedMeta && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#B8F256]" />
              <span>{optimizedMeta}</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all ${
            isDragOver
              ? "border-[#0F241D] bg-[#EEF5EB]"
              : "border-[#D6E2D2] bg-[#F9FCF8] hover:bg-[#F2F8F0]"
          }`}
        >
          {isProcessing ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-[#0F241D] animate-spin" />
              <span className="text-xs font-semibold text-slate-600">
                Compressing & optimizing photo...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#EEF5EB] text-[#0F241D] flex items-center justify-center mx-auto mb-2">
                <ImageIcon className="w-5 h-5 text-emerald-800" />
              </div>

              <p className="text-xs font-bold text-[#0F241D] mb-0.5">
                Upload photo or paste image URL
              </p>
              <p className="text-[11px] text-slate-400 mb-3 max-w-xs mx-auto">
                {helperText}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F241D] hover:bg-[#1a3f32] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B8F256]" />
                  <span>Choose File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all shadow-xs"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Paste URL</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal for Pasting Direct URL */}
      {showUrlInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-[#0F241D]">
                  Set Image URL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Paste a public image link (e.g., Unsplash, Cloudinary, AWS S3, or GitHub asset):
            </p>

            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 mb-4 focus:outline-none focus:border-[#0F241D]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveUrl();
                }
              }}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={!tempUrl.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F241D] hover:bg-[#1a3f32] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-[#B8F256]" />
                <span>Apply Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUploader;
