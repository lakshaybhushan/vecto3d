import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, Camera, ChevronDown } from "lucide-react";
import { File, Image } from "lucide-react";
import { PNG_RESOLUTIONS } from "@/lib/constants";
import { handleExport } from "@/lib/exporters";
import * as THREE from "three";

interface ExportButtonsProps {
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
}

export function ExportButtons({ fileName, modelGroupRef }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1">
            <Camera className="h-4 w-4 mr-0.5" />
            <span className="hidden sm:inline">Export Image</span>
            <ChevronDown className="h-4 w-4 ml-1" />
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
                  resolution.multiplier
                )
              }>
              <Image className="h-4 w-4 ml-1" />
              {resolution.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="flex items-center gap-1">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Export 3D</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => handleExport("stl", modelGroupRef, fileName)}>
            <File className="h-4 w-4 mr-0.5" />
            Export as STL
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleExport("glb", modelGroupRef, fileName)}>
            <File className="h-4 w-4 mr-0.5" />
            Export as GLB
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleExport("gltf", modelGroupRef, fileName)}>
            <File className="h-4 w-4 mr-0.5" />
            Export as GLTF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
