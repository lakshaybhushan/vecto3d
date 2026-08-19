"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import * as THREE from "three";
import { useEditorStore } from "@/lib/store";
import { handleExport, handleExportWithTextures } from "@/lib/exporters";
import { recordWithStoreProgress } from "@/lib/video-recorder";
import { toast } from "sonner";
import { VideoResultModal } from "@/components/modals/video-result-modal";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface MinimalExportProps {
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

function AnimatedSection({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function MinimalExport({
  fileName,
  modelGroupRef,
  canvasRef,
}: MinimalExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(10);

  const {
    textureEnabled,
    texturePreset,
    textureScale,
    autoRotate,
    setAutoRotate,
    autoRotateSpeed,
    setAutoRotateSpeed,
    setCompletedVideo,
    setVideoModalOpen,
    isRecording,
    recordingProgress,
    recordingElapsedTime,
    recordingStatus,
  } = useEditorStore();

  const handlePngExport = () => {
    handleExport("png", modelGroupRef, fileName, 3);
  };

  const handleVideoExport = async (format: "mp4" | "gif") => {
    if (!canvasRef?.current) return;

    if (!autoRotate) {
      toast.error("Enable auto-rotate first");
      return;
    }

    await recordWithStoreProgress({
      canvas: canvasRef.current,
      format,
      duration: format === "gif" ? Math.min(videoDuration, 10) : videoDuration,
      bitrate: 8000000,
      onComplete: (blob) => {
        setCompletedVideo(blob, format, fileName);
        setVideoModalOpen(true);
      },
      onError: (error) => {
        console.error("Recording failed:", error);
        toast.error("Recording failed");
      },
    });
  };

  const handle3DExport = (format: "stl" | "glb" | "gltf") => {
    if (format === "stl") {
      handleExport("stl", modelGroupRef, fileName);
    } else {
      handleExportWithTextures(format, modelGroupRef, fileName, 1, {
        textureEnabled,
        texturePreset,
        textureScale,
      });
    }
  };

  return (
    <>
      {/* Auto-Rotate Controls - Always Visible */}
      <div className="border-b border-white/[0.08] px-4 py-3 text-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Auto rotate</span>
          <Switch
            checked={autoRotate}
            onCheckedChange={setAutoRotate}
            aria-label="Auto rotate"
          />
        </div>
        <AnimatedSection isOpen={autoRotate}>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-neutral-500">Speed</span>
            <div className="flex items-center gap-3">
              <Slider
                min={0.5}
                max={10}
                step={0.5}
                value={[autoRotateSpeed]}
                onValueChange={([value]) => setAutoRotateSpeed(value)}
                aria-label="Rotation speed"
                className="w-24"
              />
              <span className="w-12 text-right text-neutral-400">
                {autoRotateSpeed.toFixed(1)}
              </span>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Export Section */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="h-auto w-full justify-between rounded-none px-4 py-3 text-[14px] font-medium text-neutral-300 hover:bg-white/[0.03] hover:text-white active:scale-100">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatedSection isOpen={isOpen}>
        <div className="border-t border-white/[0.08] px-4 py-3 text-[14px]">
          {/* IMAGE Section */}
          <div className="mb-4">
            <span className="mb-2 block text-[12px] text-neutral-500">
              Image
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePngExport}
              className="w-full">
              PNG
            </Button>
          </div>

          {/* 3D Section */}
          <div className="mb-4">
            <span className="mb-2 block text-[12px] text-neutral-500">3D</span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("stl")}
                className="w-full">
                STL
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("glb")}
                className="w-full">
                GLB
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("gltf")}
                className="w-full">
                GLTF
              </Button>
            </div>
          </div>

          {/* VIDEO Section */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[12px] text-neutral-500">Video</span>
              {isRecording && (
                <>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-[10px] text-red-400">
                    {recordingStatus === "processing"
                      ? "Processing…"
                      : `${recordingElapsedTime.toFixed(1)}s`}
                  </span>
                  <div className="h-1 w-12 overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-red-500 transition-all duration-100"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Duration - Only in VIDEO section */}
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-neutral-500">Duration</span>
                <span className="text-neutral-400">{videoDuration}s</span>
              </div>
              <Slider
                min={3}
                max={30}
                step={1}
                value={[videoDuration]}
                onValueChange={([value]) => setVideoDuration(value)}
                aria-label="Video duration"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVideoExport("mp4")}
                disabled={!autoRotate || isRecording}
                className="w-full">
                MP4
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVideoExport("gif")}
                disabled={!autoRotate || isRecording}
                className="w-full">
                GIF
              </Button>
            </div>
            {!autoRotate && (
              <p className="mt-2 text-[10px] text-neutral-600">
                Enable auto-rotate to record
              </p>
            )}
          </div>
        </div>
      </AnimatedSection>

      <VideoResultModal />
    </>
  );
}
