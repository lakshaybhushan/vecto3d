"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Minimize2 } from "lucide-react";
import type * as THREE from "three";
import { useEditorStore } from "@/lib/store";
import {
  ModelErrorState,
  ModelLoadingState,
} from "@/components/ui/model-states";

const ModelPreview = dynamic(
  () => import("@/components/previews/model-preview"),
  {
    ssr: false,
    loading: () => <ModelLoadingState message="Loading 3D preview..." />,
  },
);

type ModelViewportProps = {
  svgData: string | null | undefined;
  isMobile: boolean;
  isModelLoading: boolean;
  svgProcessingError: string | null;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  isIOS: boolean;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  modelRef: React.RefObject<THREE.Group | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export function ModelViewport({
  svgData,
  isMobile,
  isModelLoading,
  svgProcessingError,
  isFullscreen,
  isFullscreenSupported,
  isIOS,
  modelGroupRef,
  modelRef,
  canvasRef,
  containerRef,
}: ModelViewportProps) {
  const render = () => {
    if (svgProcessingError)
      return <ModelErrorState error={svgProcessingError} />;
    if (isModelLoading)
      return (
        <ModelLoadingState message="Reconstructing your 3D model geometry..." />
      );
    if (!svgData) return <ModelLoadingState message="Initializing editor..." />;

    return (
      <div className="h-full w-full md:overflow-hidden">
        <ModelPreview
          svgData={svgData}
          modelGroupRef={modelGroupRef}
          modelRef={modelRef}
          isMobile={isMobile}
          canvasRef={canvasRef}
          onLoadStart={() => useEditorStore.getState().setIsModelLoading(true)}
          onLoadComplete={() =>
            useEditorStore.getState().setIsModelLoading(false)
          }
          onError={(error) => {
            useEditorStore
              .getState()
              .setSvgProcessingError(error.message || "Failed to process SVG");
            useEditorStore.getState().setIsModelLoading(false);
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative grow" ref={containerRef}>
      {render()}
      {isFullscreen && isFullscreenSupported && !isIOS && (
        <div className="pointer-events-none absolute inset-0">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={"ghost"}
                  onClick={() => document.exitFullscreen()}
                  aria-label="Exit fullscreen"
                  className="hover:bg-background/80 pointer-events-auto absolute top-6 right-6 bg-transparent backdrop-blur-xs">
                  <Minimize2 className="h-4 w-4" />
                  <span className="sr-only">Exit fullscreen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="center"
                sideOffset={10}
                className="z-[99999] px-4 text-sm"
                container={containerRef.current || undefined}>
                Exit fullscreen
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
