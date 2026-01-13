"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import * as THREE from "three";
import { useEditorStore } from "@/lib/store";
import { handleExport, handleExportWithTextures } from "@/lib/exporters";
import { recordWithStoreProgress } from "@/lib/video-recorder";
import { toast } from "sonner";
import { VideoResultModal } from "@/components/modals/video-result-modal";

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
    <div
      className={`grid transition-all duration-200 ease-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}>
      <div className="overflow-hidden">{children}</div>
    </div>
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
      toast.error("ENABLE AUTO-ROTATE FIRST");
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
        toast.error("RECORDING FAILED");
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
      <div className="border-b border-neutral-800 px-4 py-3 font-mono text-[14px] tracking-wide uppercase">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">AUTO ROTATE</span>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`relative h-5 w-10 border transition-colors ${autoRotate ? "border-white bg-white" : "border-neutral-700 bg-neutral-900"}`}>
            <div
              className={`absolute top-0 h-full w-1/2 transition-all ${autoRotate ? "left-1/2 bg-black" : "left-0 bg-neutral-600"}`}
            />
          </button>
        </div>
        <AnimatedSection isOpen={autoRotate}>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-neutral-500">SPEED</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={autoRotateSpeed}
                onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
                className="h-1 w-24 cursor-pointer appearance-none bg-neutral-800 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="w-12 text-right text-neutral-400">
                {autoRotateSpeed.toFixed(1)}
              </span>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Export Section */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 font-mono text-[14px] tracking-wide text-neutral-400 uppercase transition-colors hover:text-white">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>EXPORT</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatedSection isOpen={isOpen}>
        <div className="border-t border-neutral-800 px-4 py-3 font-mono text-[14px] tracking-wide uppercase">
          {/* IMAGE Section */}
          <div className="mb-4">
            <span className="mb-2 block text-[12px] text-neutral-500">
              IMAGE
            </span>
            <button
              onClick={handlePngExport}
              className="w-full border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white">
              PNG
            </button>
          </div>

          {/* 3D Section */}
          <div className="mb-4">
            <span className="mb-2 block text-[12px] text-neutral-500">3D</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handle3DExport("stl")}
                className="border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white">
                STL
              </button>
              <button
                onClick={() => handle3DExport("glb")}
                className="border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white">
                GLB
              </button>
              <button
                onClick={() => handle3DExport("gltf")}
                className="border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white">
                GLTF
              </button>
            </div>
          </div>

          {/* VIDEO Section */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[12px] text-neutral-500">VIDEO</span>
              {isRecording && (
                <>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-[10px] text-red-400">
                    {recordingStatus === "processing"
                      ? "PROCESSING..."
                      : `${recordingElapsedTime.toFixed(1)}S`}
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
                <span className="text-neutral-500">DURATION</span>
                <span className="text-neutral-400">{videoDuration}S</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={videoDuration}
                onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none bg-neutral-800 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleVideoExport("mp4")}
                disabled={!autoRotate || isRecording}
                className="border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                MP4
              </button>
              <button
                onClick={() => handleVideoExport("gif")}
                disabled={!autoRotate || isRecording}
                className="border border-neutral-700 py-2 text-neutral-400 transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                GIF
              </button>
            </div>
            {!autoRotate && (
              <p className="mt-2 text-[10px] text-neutral-600">
                ENABLE AUTO-ROTATE TO RECORD
              </p>
            )}
          </div>
        </div>
      </AnimatedSection>

      <VideoResultModal />
    </>
  );
}
