import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2, Video, FileImage } from "lucide-react";
import { File, Image } from "lucide-react";
import { PNG_RESOLUTIONS } from "@/lib/constants";
import {
  handleExport,
  handleExportWithTextures,
  handlePrint,
} from "@/lib/exporters";
import { useEditorStore } from "@/lib/store";
import * as THREE from "three";
import { useEffect, useState } from "react";
import {
  ImageDownloadIcon,
  ThreeDExportIcon,
  ThreeDPrintIcon,
} from "@/components/ui/icons";
import { VideoResultModal } from "@/components/modals/video-result-modal";
import { recordWithToastProgress } from "@/lib/video-recorder";
import { toast } from "sonner";

interface ExportButtonsProps {
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function ExportButtons({
  fileName,
  modelGroupRef,
  canvasRef,
}: ExportButtonsProps) {
  const [isUS, setIsUS] = useState<boolean | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    textureEnabled,
    texturePreset,
    textureScale,
    autoRotate,
    setCompletedVideo,
    setVideoModalOpen,
  } = useEditorStore();

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const response = await fetch("/api/geo");
        const data = await response.json();
        setIsUS(data.isUS);
      } catch (error) {
        console.error("Error in location check:", error);
        setIsUS(false);
      }
    };
    checkLocation();
  }, []);

  const handlePrintClick = async () => {
    setIsPrinting(true);
    try {
      await handlePrint("stl", modelGroupRef, fileName, "m3d");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleVideoExport = async (format: "mp4" | "gif", duration: number) => {
    if (!canvasRef?.current) {
      console.error("Canvas not available for video export");
      return;
    }

    if (!autoRotate) {
      toast.error(
        "Please enable auto-rotate in Geometry settings before recording video",
      );
      return;
    }

    await recordWithToastProgress({
      canvas: canvasRef.current,
      format,
      duration,
      onComplete: (blob) => {
        setCompletedVideo(blob, format, fileName);
        setVideoModalOpen(true);
      },
      onError: (error) => {
        console.error("Recording failed:", error);
      },
    });
  };

  const handleNewRecording = (format: "mp4" | "gif", duration: number) => {
    handleVideoExport(format, duration);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1">
            <ImageDownloadIcon />
            <span className="hidden sm:inline">Export Image</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {PNG_RESOLUTIONS.map((resolution) => (
            <DropdownMenuItem
              key={resolution.multiplier}
              onSelect={() =>
                handleExport(
                  "png",
                  modelGroupRef,
                  fileName,
                  resolution.multiplier,
                )
              }>
              <Image className="h-4 w-4" aria-label="Export as PNG" />
              {resolution.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Export Video</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="text-muted-foreground px-2 py-1.5 text-sm font-medium">
            Record MP4
          </div>
          <DropdownMenuItem
            onSelect={() => handleVideoExport("mp4", 5)}
            disabled={!canvasRef?.current || !autoRotate}>
            <Video className="h-4 w-4" />
            MP4 - 5 seconds
            {!autoRotate && (
              <span className="text-muted-foreground ml-auto text-xs">*</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleVideoExport("mp4", 10)}
            disabled={!canvasRef?.current || !autoRotate}>
            <Video className="h-4 w-4" />
            MP4 - 10 seconds
            {!autoRotate && (
              <span className="text-muted-foreground ml-auto text-xs">*</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="text-muted-foreground px-2 py-1.5 text-sm font-medium">
            Record GIF
          </div>
          <DropdownMenuItem
            onSelect={() => handleVideoExport("gif", 3)}
            disabled={!canvasRef?.current || !autoRotate}>
            <FileImage className="h-4 w-4" />
            GIF - 3 seconds
            {!autoRotate && (
              <span className="text-muted-foreground ml-auto text-xs">*</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleVideoExport("gif", 5)}
            disabled={!canvasRef?.current || !autoRotate}>
            <FileImage className="h-4 w-4" />
            GIF - 5 seconds
            {!autoRotate && (
              <span className="text-muted-foreground ml-auto text-xs">*</span>
            )}
          </DropdownMenuItem>
          {!autoRotate && (
            <>
              <DropdownMenuSeparator />
              <div className="text-muted-foreground px-2 py-1.5 text-xs">
                * Enable auto-rotate in Geometry settings
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1">
            {/* <Box className="h-4 w-4" /> */}
            <ThreeDExportIcon />
            <span className="hidden sm:inline">Export 3D</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44" side="bottom">
          <DropdownMenuItem
            onSelect={() => handleExport("stl", modelGroupRef, fileName)}>
            <File className="h-4 w-4" />
            Export as STL
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              handleExportWithTextures("glb", modelGroupRef, fileName, 1, {
                textureEnabled,
                texturePreset,
                textureScale,
              })
            }>
            <File className="h-4 w-4" />
            Export as GLB{textureEnabled ? " + Textures" : ""}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              handleExportWithTextures("gltf", modelGroupRef, fileName, 1, {
                textureEnabled,
                texturePreset,
                textureScale,
              })
            }>
            <File className="h-4 w-4" />
            Export as GLTF{textureEnabled ? " + Textures" : ""}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isUS === true && (
        <Button
          size="sm"
          className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={handlePrintClick}
          disabled={isPrinting}>
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThreeDPrintIcon />
          )}
          <span className="hidden sm:inline">
            {isPrinting ? "Processing..." : "3D Print"}
          </span>
        </Button>
      )}

      <VideoResultModal onStartNewRecording={handleNewRecording} />
    </div>
  );
}
