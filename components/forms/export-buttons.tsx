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
      toast.error(
        "Please enable auto-rotate in Geometry settings before recording video",
      );
      return;
    }

    setIsDropdownOpen(false);

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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-4">
          <Tabs defaultValue="png" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="png" className="flex items-center gap-1">
                <Image className="h-4 w-4" />
                PNG
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                Video
              </TabsTrigger>
              <TabsTrigger value="3d" className="flex items-center gap-1">
                <ThreeDExportIcon />
                3D Model
              </TabsTrigger>
            </TabsList>

            <TabsContent value="png" className="mt-4 space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Export PNG Image</h4>
                <p className="text-muted-foreground mb-3 text-xs">
                  Export high-quality PNG image of your 3D model
                </p>
                <Button
                  onClick={handlePngExport}
                  className="flex w-full items-center gap-2">
                  <ImageDownloadIcon />
                  Export High Quality PNG
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-4 space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Export Video</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-2 block text-xs">
                      Video Duration: {videoDuration[0]} seconds
                    </label>
                    <Slider
                      value={videoDuration}
                      onValueChange={setVideoDuration}
                      min={5}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                      <span>5s</span>
                      <span>30s</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleVideoExport("mp4", videoDuration[0])}
                      disabled={!canvasRef?.current || !autoRotate}
                      className="flex w-full items-center gap-2">
                      <Video className="h-4 w-4" />
                      Export MP4 ({videoDuration[0]}s)
                    </Button>

                    <Button
                      onClick={() =>
                        handleVideoExport("gif", Math.min(videoDuration[0], 10))
                      }
                      disabled={!canvasRef?.current || !autoRotate}
                      variant="outline"
                      className="flex w-full items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      Export GIF ({Math.min(videoDuration[0], 10)}s max)
                    </Button>
                  </div>

                  {!autoRotate && (
                    <div className="text-muted-foreground bg-muted rounded p-2 text-xs">
                      * Enable auto-rotate in Geometry settings to record videos
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="3d" className="mt-4 space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Export 3D Model</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handle3DExport("stl")}
                    variant="outline"
                    className="flex w-full items-center justify-start gap-2">
                    <File className="h-4 w-4" />
                    STL (3D Printing)
                  </Button>

                  <Button
                    onClick={() => handle3DExport("glb")}
                    variant="outline"
                    className="flex w-full items-center justify-start gap-2">
                    <File className="h-4 w-4" />
                    GLB{textureEnabled ? " + Textures" : ""} (Binary)
                  </Button>

                  <Button
                    onClick={() => handle3DExport("gltf")}
                    variant="outline"
                    className="flex w-full items-center justify-start gap-2">
                    <File className="h-4 w-4" />
                    GLTF{textureEnabled ? " + Textures" : ""} (JSON)
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
