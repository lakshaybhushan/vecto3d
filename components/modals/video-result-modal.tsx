"use client";

import React, { useEffect, useState } from "react";
import { X, Video, FileImage, Download } from "lucide-react";
import { downloadRecording } from "@/lib/video-recorder";
import { useEditorStore } from "@/lib/store";
import { toast } from "sonner";

export function VideoResultModal() {
  const {
    videoModalOpen,
    setVideoModalOpen,
    completedVideoBlob,
    completedVideoFormat,
    completedVideoFileName,
  } = useEditorStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (completedVideoBlob && videoModalOpen) {
      const url = URL.createObjectURL(completedVideoBlob);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [completedVideoBlob, videoModalOpen]);

  const handleDownload = () => {
    if (!completedVideoBlob || !completedVideoFileName || !completedVideoFormat)
      return;

    const mimeType = completedVideoBlob.type;
    let extension = completedVideoFormat === "gif" ? "gif" : "mp4";

    if (mimeType.includes("mp4")) {
      extension = "mp4";
    } else if (mimeType.includes("webm")) {
      extension = "webm";
    } else if (completedVideoFormat === "gif") {
      extension = "gif";
    }

    const cleanFileName = completedVideoFileName.replace(".svg", "");
    downloadRecording(completedVideoBlob, `${cleanFileName}.${extension}`);
    toast.success(
      `DOWNLOADED ${cleanFileName.toUpperCase()}.${extension.toUpperCase()}`,
    );
  };

  const handleClose = () => {
    setVideoModalOpen(false);
  };

  const getActualFormat = () => {
    if (!completedVideoBlob || !completedVideoFormat) return "";
    if (completedVideoBlob.type.includes("mp4")) return "MP4";
    if (completedVideoBlob.type.includes("webm")) return "WEBM";
    if (completedVideoFormat === "gif") return "GIF";
    return completedVideoFormat.toUpperCase();
  };

  const getFileSize = () => {
    if (!completedVideoBlob) return "";
    return `${(completedVideoBlob.size / 1024 / 1024).toFixed(2)} MB`;
  };

  if (!completedVideoBlob || !completedVideoFormat || !completedVideoFileName) {
    return null;
  }

  if (!videoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal - Landscape */}
      <div className="relative z-10 w-full max-w-2xl border border-neutral-800 bg-black font-mono text-[14px] tracking-wide uppercase">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            {completedVideoFormat === "mp4" ? (
              <Video className="h-4 w-4" />
            ) : (
              <FileImage className="h-4 w-4" />
            )}
            <span>
              {completedVideoFileName?.replace(".svg", "")}.
              {getActualFormat().toLowerCase()}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-500 transition-colors hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview - Landscape 16:9 */}
        <div className="p-4">
          {previewUrl && (
            <div className="aspect-video w-full border border-neutral-800 bg-neutral-900">
              {completedVideoFormat === "gif" ? (
                <img
                  src={previewUrl}
                  alt="Recorded GIF preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          )}

          {/* File Info */}
          <div className="mt-4 flex items-center justify-between border border-neutral-800 px-3 py-2">
            <span className="text-white">
              {completedVideoFileName?.replace(".svg", "")}.
              {getActualFormat().toLowerCase()}
            </span>
            <div className="flex items-center gap-3">
              <span className="border border-neutral-700 px-2 py-0.5 text-[12px] text-neutral-400">
                {getActualFormat()}
              </span>
              <span className="text-[12px] text-neutral-500">
                {getFileSize()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-800 p-4">
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 border border-white bg-white py-2.5 text-[12px] text-black transition-colors hover:bg-neutral-200">
            <Download className="h-3.5 w-3.5" />
            DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
