"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, Upload, Building2 } from "lucide-react";
import { useMutationApi } from "@/hooks/api/useMutationApi";
import { ENDPOINTS } from "@/lib/api/api-endpoints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

interface LogoUploadProps {
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  defaultUrl?: string;
  className?: string;
}

export function LogoUpload({
  onUploadSuccess,
  onRemove,
  maxSizeMB = 2,
  defaultUrl = "",
  className,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl || null);
  const [error, setError] = useState<string | null>(null);

  const getPresignedUrlMutation = useMutationApi<{ presignedUrl: string; publicUrl: string; fileName: string }, { fileName: string; fileType: string }>(
    ENDPOINTS.UPLOAD.URL,
    { method: "POST" }
  );

  React.useEffect(() => {
    setPreviewUrl(defaultUrl || null);
  }, [defaultUrl]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  const uploadToS3 = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Optimize & compress image
      let fileToUpload = file;
      if (file.type.startsWith("image/") && !file.type.includes("svg")) {
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: file.type.includes("png") ? "image/png" : "image/jpeg",
          });
          fileToUpload = new File([compressed], file.name, {
            type: compressed.type || file.type,
          });
        } catch (compErr) {
          console.warn("Logo compression fallback:", compErr);
        }
      }

      // 2. Get presigned URL
      const response = await getPresignedUrlMutation.mutateAsync({
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
      });
      
      const { presignedUrl, publicUrl } = response.data;

      // 3. Upload file directly to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileToUpload.type,
        },
        body: fileToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload to S3: ${uploadRes.status}`);
      }

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
    } catch (err: any) {
      console.error("Logo upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Logo exceeds ${maxSizeMB}MB.`);
      e.target.value = "";
      return;
    }

    await uploadToS3(file);
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      
      <div className="relative group">
        <div 
          className={cn(
            "relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-sky-100 bg-sky-50/30 flex items-center justify-center transition-all duration-300",
            !previewUrl && !isUploading && "hover:border-sky-300 cursor-pointer",
            previewUrl && "border-solid border-sky-200"
          )}
          onClick={!isUploading ? handleClick : undefined}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center bg-white/80 absolute inset-0 z-10">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : previewUrl ? (
            <>
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={previewUrl} className="object-cover" />
                <AvatarFallback className="bg-sky-50">
                  <Building2 className="w-12 h-12 text-sky-200" />
                </AvatarFallback>
              </Avatar>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-sky-400">
              <Upload className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Upload</span>
            </div>
          )}
        </div>

        {previewUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-20"
            title="Remove Logo"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
          >
            {previewUrl ? "Change Logo" : "Select Logo"}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              Remove
            </Button>
          )}
        </div>
        
        {error && (
          <p className="text-[11px] font-medium text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
