import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, Camera, ChevronDown, Printer } from "lucide-react";
import { File, Image } from "lucide-react";
import { PNG_RESOLUTIONS } from "@/lib/constants";
import { handleExport, handlePrint } from "@/lib/exporters";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { checkIsUSLocation } from "@/lib/utils";

interface ExportButtonsProps {
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
}

export function ExportButtons({ fileName, modelGroupRef }: ExportButtonsProps) {
  const [isUS, setIsUS] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      const isUSLocation = await checkIsUSLocation();
      console.log("isUSLocation", isUSLocation);
      setIsUS(isUSLocation);
    };
    checkLocation();
  }, []);

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
                  resolution.multiplier,
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
      {isUS && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <svg fill="none" height="258" viewBox="0 0 231 258" width="231" xmlns="http://www.w3.org/2000/svg"><path d="m231 78.3853c0-9.8537-5.268-18.9588-13.821-23.8857l-87.858-50.61478c-8.553-4.92683-19.089-4.92683-27.641 0l-87.8595 50.61478c-8.55215 4.9269-13.8205 14.032-13.8205 23.8857v101.2297c0 9.854 5.26835 18.959 13.8205 23.886l87.8595 50.614c8.552 4.927 19.088 4.927 27.641 0l87.858-50.614c8.553-4.927 13.821-14.032 13.821-23.886zm-206.1231 41.9977c0-6.403 6.9745-10.379 12.5024-7.129l71.1037 41.811c4.33 2.547 9.704 2.547 14.034 0l71.104-41.811c5.528-3.25 12.502.726 12.502 7.129v52.862c0 4.927-2.634 9.48-6.91 11.943l-76.803 44.246c-4.276 2.463-9.544 2.463-13.82 0l-76.8028-44.246c-4.2761-2.463-6.9103-7.016-6.9103-11.943z" fill="#000" /></svg>
              <span className="hidden sm:inline">3D Print It</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">

            <DropdownMenuItem
              onSelect={() => handlePrint("stl", modelGroupRef, fileName, 1, "m3d")}>
              <svg fill="none" height="258" viewBox="0 0 231 258" width="231" xmlns="http://www.w3.org/2000/svg"><path d="m231 78.3853c0-9.8537-5.268-18.9588-13.821-23.8857l-87.858-50.61478c-8.553-4.92683-19.089-4.92683-27.641 0l-87.8595 50.61478c-8.55215 4.9269-13.8205 14.032-13.8205 23.8857v101.2297c0 9.854 5.26835 18.959 13.8205 23.886l87.8595 50.614c8.552 4.927 19.088 4.927 27.641 0l87.858-50.614c8.553-4.927 13.821-14.032 13.821-23.886zm-206.1231 41.9977c0-6.403 6.9745-10.379 12.5024-7.129l71.1037 41.811c4.33 2.547 9.704 2.547 14.034 0l71.104-41.811c5.528-3.25 12.502.726 12.502 7.129v52.862c0 4.927-2.634 9.48-6.91 11.943l-76.803 44.246c-4.276 2.463-9.544 2.463-13.82 0l-76.8028-44.246c-4.2761-2.463-6.9103-7.016-6.9103-11.943z" fill="#fff" /></svg>
              3D Print with M3D
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
