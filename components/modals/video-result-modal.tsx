"use client";

import React, { useEffect, useState } from "react";
import { Video, FileImage, Download } from "lucide-react";
import { downloadRecording } from "@/lib/video-recorder";
import { useEditorStore } from "@/lib/store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    toast.success(`Downloaded ${cleanFileName}.${extension}`);
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

  return (
    <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
      <DialogContent
        className="max-w-2xl gap-0 overflow-hidden border-white/10 bg-neutral-950 p-0 text-[14px] shadow-2xl"
        showCloseButton>
        <DialogHeader className="border-b border-white/[0.08] px-4 py-3 pr-12">
          <DialogTitle className="flex items-center gap-2 text-sm font-medium text-white">
            {completedVideoFormat === "mp4" ? (
              <Video className="h-4 w-4" />
            ) : (
              <FileImage className="h-4 w-4" />
            )}
            <span>
              {completedVideoFileName?.replace(".svg", "")}.
              {getActualFormat().toLowerCase()}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and download the completed recording.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          {previewUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-md border border-white/[0.08] bg-neutral-900">
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
          <div className="mt-4 flex items-center justify-between rounded-md border border-white/[0.08] px-3 py-2">
            <span className="text-white">
              {completedVideoFileName?.replace(".svg", "")}.
              {getActualFormat().toLowerCase()}
            </span>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-white/10 text-neutral-400">
                {getActualFormat()}
              </Badge>
              <span className="text-[12px] text-neutral-500">
                {getFileSize()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/[0.08] p-4">
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
