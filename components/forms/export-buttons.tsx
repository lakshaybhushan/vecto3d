import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Loader2, Video, FileImage, Download } from "lucide-react";
import { File, Image } from "lucide-react";
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
  const [videoDuration, setVideoDuration] = useState([10]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      toast.error("ENABLE AUTO-ROTATE IN GEOMETRY SETTINGS FIRST");
      return;
    }

    setIsDropdownOpen(false);

    await recordWithToastProgress({
      canvas: canvasRef.current,
      format,
      duration,
      bitrate: 8000000,
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

  const handlePngExport = () => {
    handleExport("png", modelGroupRef, fileName, 3);
    setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
  };

  const monoStyle = "font-mono text-[14px] uppercase tracking-wide";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="default"
            className={`flex items-center gap-1 ${monoStyle}`}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">EXPORT</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[380px] overflow-hidden rounded-xl p-0 shadow-2xl">
          <Tabs defaultValue="png" className="w-full">
            <div className="border-b p-3">
              <TabsList className="bg-muted/60 grid w-full grid-cols-3 gap-1 rounded-lg p-1">
                <TabsTrigger
                  value="png"
                  className={`data-[state=active]:bg-background flex items-center gap-1 rounded-md data-[state=active]:shadow-sm ${monoStyle}`}>
                  <Image className="h-4 w-4" />
                  PNG
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className={`data-[state=active]:bg-background flex items-center gap-1 rounded-md data-[state=active]:shadow-sm ${monoStyle}`}>
                  <Video className="h-4 w-4" />
                  VIDEO
                </TabsTrigger>
                <TabsTrigger
                  value="3d"
                  className={`data-[state=active]:bg-background flex items-center gap-1 rounded-md data-[state=active]:shadow-sm ${monoStyle}`}>
                  <ThreeDExportIcon />
                  3D
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="png" className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className={`font-medium ${monoStyle}`}>EXPORT PNG</h4>
                <p className={`text-muted-foreground ${monoStyle} text-[12px]`}>
                  CRISP, TRANSPARENT PNG OF YOUR 3D MODEL
                </p>
              </div>
              <Button
                onClick={handlePngExport}
                className={`flex w-full items-center justify-center gap-2 ${monoStyle}`}>
                <ImageDownloadIcon />
                EXPORT HIGH QUALITY PNG
              </Button>
            </TabsContent>

            <TabsContent value="video" className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className={`font-medium ${monoStyle}`}>EXPORT VIDEO</h4>
                <p className={`text-muted-foreground ${monoStyle} text-[12px]`}>
                  AUTO-ROTATE MUST BE ENABLED
                </p>
              </div>

              <div>
                <label
                  className={`text-muted-foreground mb-2 block ${monoStyle} text-[12px]`}>
                  DURATION: {videoDuration[0]}S
                </label>
                <Slider
                  value={videoDuration}
                  onValueChange={setVideoDuration}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div
                  className={`text-muted-foreground mt-1 flex justify-between ${monoStyle} text-[11px]`}>
                  <span>5S</span>
                  <span>30S</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleVideoExport("mp4", videoDuration[0])}
                  disabled={!canvasRef?.current || !autoRotate}
                  className={`flex w-full items-center gap-2 ${monoStyle}`}>
                  <Video className="h-4 w-4" />
                  MP4
                </Button>
                <Button
                  onClick={() =>
                    handleVideoExport("gif", Math.min(videoDuration[0], 10))
                  }
                  disabled={!canvasRef?.current || !autoRotate}
                  variant="outline"
                  className={`flex w-full items-center gap-2 ${monoStyle}`}>
                  <FileImage className="h-4 w-4" />
                  GIF
                </Button>
              </div>
              {!autoRotate && (
                <div
                  className={`text-muted-foreground bg-muted rounded-md px-3 py-2 ${monoStyle} text-[12px]`}>
                  ENABLE AUTO-ROTATE IN GEOMETRY SETTINGS
                </div>
              )}
            </TabsContent>

            <TabsContent value="3d" className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className={`font-medium ${monoStyle}`}>EXPORT 3D MODEL</h4>
                <p className={`text-muted-foreground ${monoStyle} text-[12px]`}>
                  FOR PRINTING OR 3D APPS
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handle3DExport("stl")}
                  variant="outline"
                  className={`flex w-full items-center justify-start gap-2 ${monoStyle}`}>
                  <File className="h-4 w-4" />
                  STL
                </Button>
                <Button
                  onClick={() => handle3DExport("glb")}
                  variant="outline"
                  className={`flex w-full items-center justify-start gap-2 ${monoStyle}`}>
                  <File className="h-4 w-4" />
                  GLB{textureEnabled ? " + TEX" : ""}
                </Button>
                <Button
                  onClick={() => handle3DExport("gltf")}
                  variant="outline"
                  className={`flex w-full items-center justify-start gap-2 ${monoStyle}`}>
                  <File className="h-4 w-4" />
                  GLTF{textureEnabled ? " + TEX" : ""}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>

      {isUS === true && (
        <Button
          size="sm"
          className={`flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 ${monoStyle}`}
          onClick={handlePrintClick}
          disabled={isPrinting}>
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThreeDPrintIcon />
          )}
          <span className="hidden sm:inline">
            {isPrinting ? "PROCESSING..." : "3D PRINT"}
          </span>
        </Button>
      )}

      <VideoResultModal />
    </div>
  );
}
