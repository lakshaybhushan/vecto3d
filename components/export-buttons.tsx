import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";
import { File, Image } from "lucide-react";
import { PNG_RESOLUTIONS } from "@/lib/constants";
import { handleExport, handlePrint } from "@/lib/exporters";
import * as THREE from "three";
import { useEffect, useState } from "react";
import {
  ImageDownloadIcon,
  ThreeDExportIcon,
  ThreeDPrintIcon,
} from "@/components/ui/ui-icons";

interface ExportButtonsProps {
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
}

export function ExportButtons({ fileName, modelGroupRef }: ExportButtonsProps) {
  const [isUS, setIsUS] = useState<boolean | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
            onSelect={() => handleExport("glb", modelGroupRef, fileName)}>
            <File className="h-4 w-4" />
            Export as GLB
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleExport("gltf", modelGroupRef, fileName)}>
            <File className="h-4 w-4" />
            Export as GLTF
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
    </div>
  );
}
