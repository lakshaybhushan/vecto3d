"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { ExportButtons } from "@/components/forms/export-buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import type * as THREE from "three";

type EditHeaderProps = {
  isMobile: boolean;
  isFullscreenSupported: boolean;
  isIOS: boolean;
  isFullscreen: boolean;
  onBack: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  svgData?: string | null;
  fileName: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function EditHeader({
  isMobile,
  isFullscreenSupported,
  isIOS,
  isFullscreen,
  onBack,
  onReset,
  onToggleFullscreen,
  svgData,
  fileName,
  modelGroupRef,
  canvasRef,
}: EditHeaderProps) {
  return (
    <header
      className={`bg-background/80 z-20 w-full border-b border-dashed backdrop-blur-xs ${
        isMobile
          ? "bg-background/95 flex-shrink-0 backdrop-blur-xl"
          : "sticky top-0"
      }`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            onClick={onBack}
            aria-label="Back to home">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          {isMobile && (
            <div className="ml-2">
              <h1 className="text-lg font-medium">Preview</h1>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onReset}
                      aria-label="Reset editor settings">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    sideOffset={10}
                    className="px-4 text-sm">
                    Reset all settings
                  </TooltipContent>
                </Tooltip>
                {isFullscreenSupported && !isIOS && (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={onToggleFullscreen}
                        aria-label={
                          isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                        }>
                        {isFullscreen ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      sideOffset={10}
                      className="px-4 text-sm">
                      Full Screen
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          )}
          <ModeToggle />
          {svgData && (
            <ExportButtons
              fileName={fileName}
              modelGroupRef={modelGroupRef}
              canvasRef={canvasRef}
            />
          )}
        </div>
      </div>
    </header>
  );
}
