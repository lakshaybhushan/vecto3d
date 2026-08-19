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
import { cn } from "@/lib/utils";

const sliderClass =
  "mt-2 w-full [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-white/70 [&_[data-slot=slider-thumb]]:bg-[#121212] [&_[data-slot=slider-thumb]]:hover:ring-2";

interface MinimalExportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
      <CollapsibleContent className="overflow-hidden">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ExportGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.05] py-3 last:border-b-0">
      <span className="mb-2.5 block font-medium text-[#888]">{label}</span>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const precision = step < 1 ? 1 : 0;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#888]">{label}</span>
        <span className="text-[#c8c8c8] tabular-nums">
          {value.toFixed(precision)}
          {suffix}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([nextValue]) => onChange(nextValue)}
        aria-label={label}
        className={sliderClass}
      />
    </div>
  );
}

export function MinimalExport({
  isOpen,
  onOpenChange,
  fileName,
  modelGroupRef,
  canvasRef,
}: MinimalExportProps) {
  const [videoDuration, setVideoDuration] = useState(10);

  const textureEnabled = useEditorStore((state) => state.textureEnabled);
  const texturePreset = useEditorStore((state) => state.texturePreset);
  const textureScale = useEditorStore((state) => state.textureScale);
  const autoRotate = useEditorStore((state) => state.autoRotate);
  const setAutoRotate = useEditorStore((state) => state.setAutoRotate);
  const autoRotateSpeed = useEditorStore((state) => state.autoRotateSpeed);
  const setAutoRotateSpeed = useEditorStore(
    (state) => state.setAutoRotateSpeed,
  );
  const setCompletedVideo = useEditorStore((state) => state.setCompletedVideo);
  const setVideoModalOpen = useEditorStore((state) => state.setVideoModalOpen);
  const isRecording = useEditorStore((state) => state.isRecording);
  const recordingProgress = useEditorStore((state) => state.recordingProgress);
  const recordingElapsedTime = useEditorStore(
    (state) => state.recordingElapsedTime,
  );
  const recordingStatus = useEditorStore((state) => state.recordingStatus);

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
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenChange(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "h-10 w-full justify-between rounded-none px-3.5 py-0 text-[14px] font-medium text-[#aaa] hover:bg-white/[0.03] hover:text-white active:scale-100",
          isOpen && "bg-white/[0.025] text-white",
        )}>
        <div className="flex items-center gap-2">
          <Download className="size-3.5" />
          <span>Export</span>
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 text-[#666] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen && "rotate-180 text-[#999]",
          )}
        />
      </Button>

      <AnimatedSection isOpen={isOpen}>
        <div className="max-h-[62dvh] scrollbar-thin overflow-y-auto border-t border-white/[0.05] px-3.5 text-[14px]">
          <ExportGroup label="Image">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePngExport}
              className="w-full rounded-md text-[14px]">
              PNG
            </Button>
          </ExportGroup>

          <ExportGroup label="3D">
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("stl")}
                className="w-full rounded-md text-[14px]">
                STL
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("glb")}
                className="w-full rounded-md text-[14px]">
                GLB
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handle3DExport("gltf")}
                className="w-full rounded-md text-[14px]">
                GLTF
              </Button>
            </div>
          </ExportGroup>

          <ExportGroup label="Video">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#888]">Auto rotate</span>
              <Switch
                checked={autoRotate}
                onCheckedChange={setAutoRotate}
                aria-label="Auto rotate"
                className="border-white/10 data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
              />
            </div>
            <AnimatedSection isOpen={autoRotate}>
              <SliderRow
                label="Speed"
                value={autoRotateSpeed}
                min={0.5}
                max={10}
                step={0.5}
                onChange={setAutoRotateSpeed}
              />
            </AnimatedSection>
            <SliderRow
              label="Duration"
              value={videoDuration}
              suffix="s"
              min={3}
              max={30}
              step={1}
              onChange={setVideoDuration}
            />

            {isRecording ? (
              <div className="mb-3 rounded-md border border-white/[0.06] bg-white/[0.025] p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[#c8c8c8]">
                    <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
                    {recordingStatus === "processing"
                      ? "Processing…"
                      : "Recording"}
                  </span>
                  <span className="text-[#777] tabular-nums">
                    {recordingElapsedTime.toFixed(1)}s
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full bg-white transition-[width] duration-100"
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVideoExport("mp4")}
                disabled={!autoRotate || isRecording}
                className="w-full rounded-md text-[14px]">
                MP4
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVideoExport("gif")}
                disabled={!autoRotate || isRecording}
                className="w-full rounded-md text-[14px]">
                GIF
              </Button>
            </div>
            {!autoRotate ? (
              <p className="mt-2.5 text-[#666]">
                Turn on auto rotate to record.
              </p>
            ) : null}
          </ExportGroup>
        </div>
      </AnimatedSection>

      <VideoResultModal />
    </>
  );
}
