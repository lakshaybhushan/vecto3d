import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Video, FileImage, RotateCcw } from "lucide-react";
import { downloadRecording } from "@/lib/video-recorder";
import { useEditorStore } from "@/lib/store";
import { toast } from "sonner";

interface VideoResultModalProps {
  onStartNewRecording: (format: "mp4" | "gif", duration: number) => void;
}

export function VideoResultModal({
  onStartNewRecording,
}: VideoResultModalProps) {
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

    // Detect actual format from the blob
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

  const handleClose = () => {
    setVideoModalOpen(false);
  };

  const handleNewRecording = (format: "mp4" | "gif", duration: number) => {
    setVideoModalOpen(false);
    onStartNewRecording(format, duration);
  };

  const getActualFormat = () => {
    if (!completedVideoBlob || !completedVideoFormat) return "";
    if (completedVideoBlob.type.includes("mp4")) return "MP4";
    if (completedVideoBlob.type.includes("webm")) return "WebM";
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
    <Dialog open={videoModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader className="space-y-3 text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            {completedVideoFormat === "mp4" ? (
              <Video className="h-5 w-5" />
            ) : (
              <FileImage className="h-5 w-5" />
            )}
            Recording Complete
          </DialogTitle>
          <DialogDescription>
            Your {completedVideoFormat.toUpperCase()} recording is ready for
            download
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {previewUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="bg-muted aspect-square overflow-hidden rounded-lg">
                  {completedVideoFormat === "gif" ? (
                    <img
                      src={previewUrl}
                      alt="Recorded GIF preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {completedVideoFileName?.replace(".svg", "")}.
                {getActualFormat().toLowerCase()}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getActualFormat()}</Badge>
                <span className="text-muted-foreground text-xs">
                  {getFileSize()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <div className="flex flex-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleNewRecording("mp4", 5)}
              className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              New MP4
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNewRecording("gif", 3)}
              className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              New GIF
            </Button>
          </div>
          <Button onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
