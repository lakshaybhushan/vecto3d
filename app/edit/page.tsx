"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type * as THREE from "three";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GeometryControls } from "@/components/controls/geometry-controls";
import { MaterialControls } from "@/components/controls/material-controls";
import { TextureControls } from "@/components/controls/texture-controls";
import { EnvironmentControls } from "@/components/controls/environment-controls";
import { BackgroundControls } from "@/components/controls/background-controls";

import {
  useMobileDetection,
  useIOSDetection,
  useFullscreenSupport,
} from "@/hooks/use-mobile-detection";
import { useTexturePreloader } from "@/hooks/use-texture-preloader";
import { useEditorStore } from "@/lib/store";
import { memoryManager } from "@/lib/memory-manager";

import { AnimatedTabs } from "@/components/edit/animated-tabs";
import { MobileTabBar } from "@/components/edit/mobile-tab-bar";
import { EditHeader } from "@/components/edit/edit-header";
import { EditManagers } from "@/components/edit/edit-managers";
import { ModelViewport } from "@/components/edit/model-viewport";

// extracted components are imported above

export default function EditPage() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("geometry");
  const [activeTab, setActiveTab] = useState("geometry");
  const svgData = useEditorStore((state) => state.svgData);
  const fileName = useEditorStore((state) => state.fileName);
  const isModelLoading = useEditorStore((state) => state.isModelLoading);
  const svgProcessingError = useEditorStore(
    (state) => state.svgProcessingError,
  );
  const isFullscreen = useEditorStore((state) => state.isFullscreen);
  const setIsFullscreen = useEditorStore((state) => state.setIsFullscreen);
  const resetEditor = useEditorStore((state) => state.resetEditor);

  const modelGroupRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const router = useRouter();
  const { isMobile, clearMobilePreference } = useMobileDetection();
  const isIOS = useIOSDetection();
  const isFullscreenSupported = useFullscreenSupport();

  // Initialize texture preloader
  useTexturePreloader(true);

  useEffect(() => {
    setIsClientMounted(true);

    // Track model refs with memory manager
    const modelGroup = modelGroupRef.current;
    const model = modelRef.current;

    if (modelGroup) {
      memoryManager.track(modelGroup);
    }
    if (model) {
      memoryManager.track(model);
    }

    // Cleanup session storage when component unmounts (user navigates away)
    return () => {
      // Cleanup tracked models
      if (modelGroup) {
        memoryManager.untrack(modelGroup);
      }
      if (model) {
        memoryManager.untrack(model);
      }

      // Only clear if user is not reloading (which would cause immediate unmount/mount)
      const currentPath = window.location.pathname;
      if (currentPath !== "/edit") {
        sessionStorage.removeItem("vecto3d_svgData");
        sessionStorage.removeItem("vecto3d_fileName");
        // Trigger memory cleanup when leaving edit page
        memoryManager.scheduleCleanup();
      }
    };
  }, []);

  const handleBackToHome = () => {
    clearMobilePreference();
    // Clear session storage when intentionally navigating back to home
    sessionStorage.removeItem("vecto3d_svgData");
    sessionStorage.removeItem("vecto3d_fileName");
    router.push("/");
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  if (!isClientMounted) {
    return null;
  }

  return (
    <main className="bg-background safari-fix relative flex h-screen w-full flex-col overflow-hidden">
      <EditManagers />

      <EditHeader
        isMobile={isMobile}
        isFullscreenSupported={isFullscreenSupported}
        isIOS={isIOS}
        isFullscreen={isFullscreen}
        onBack={handleBackToHome}
        onReset={() => {
          resetEditor();
          toast.success("Editor settings reset to default");
        }}
        onToggleFullscreen={() => {
          if (isFullscreen) {
            document.exitFullscreen();
          } else if (previewContainerRef.current) {
            previewContainerRef.current.requestFullscreen();
          }
        }}
        svgData={svgData}
        fileName={fileName}
        modelGroupRef={modelGroupRef}
        canvasRef={canvasRef}
      />

      <div
        className={`flex-1 ${isMobile ? "flex flex-col gap-0 overflow-hidden" : "px-4 py-4"}`}>
        {isMobile ? (
          <div
            key="editor-content"
            className={`grid grid-cols-1 ${isMobile ? "h-[calc(100vh-8rem)] overflow-hidden" : "gap-6 md:gap-8"} xl:grid-cols-12`}>
            {/* Mobile: Show preview or controls based on screen */}
            <div
              className={`col relative ${isMobile ? "order-first h-[40vh] overflow-hidden" : "order-first xl:order-last"} ${isMobile ? "" : "h-[70dvh]"} overflow-hidden xl:order-last xl:col-span-7 xl:h-[calc(100vh-8rem)] ${isMobile ? "md:block" : ""}`}>
              <Card
                className={`flex h-full w-full flex-col overflow-hidden ${isMobile ? "rounded-none border-0" : "border"}`}>
                {!isMobile && (
                  <CardHeader className="bg-background/80 z-10 flex flex-row items-center justify-between border-b p-4 backdrop-blur-xs [.border-b]:pb-4">
                    <div>
                      <CardTitle className="text-xl font-medium">
                        Preview
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {!svgData
                          ? "Loading SVG data..."
                          : isModelLoading
                            ? "Processing SVG..."
                            : "Interact with your 3D model"}
                      </CardDescription>
                    </div>
                    <TooltipProvider>
                      <div className="flex gap-2">
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                resetEditor();
                                toast.success(
                                  "Editor settings reset to default",
                                );
                              }}
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
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                if (isFullscreen) {
                                  document.exitFullscreen();
                                } else if (previewContainerRef.current) {
                                  previewContainerRef.current.requestFullscreen();
                                }
                              }}
                              aria-label={
                                isFullscreen
                                  ? "Exit fullscreen"
                                  : "Enter fullscreen"
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
                      </div>
                    </TooltipProvider>
                  </CardHeader>
                )}
                <ModelViewport
                  svgData={svgData}
                  isMobile={isMobile}
                  isModelLoading={isModelLoading}
                  svgProcessingError={svgProcessingError}
                  isFullscreen={isFullscreen}
                  isFullscreenSupported={isFullscreenSupported}
                  isIOS={isIOS}
                  modelGroupRef={modelGroupRef}
                  modelRef={modelRef}
                  canvasRef={canvasRef}
                  containerRef={previewContainerRef}
                />
              </Card>
            </div>
            {/* Desktop Controls */}
            <div className="order-last hidden space-y-6 md:block xl:order-first xl:col-span-5">
              <Card className="flex max-h-[50dvh] w-full flex-col overflow-hidden border lg:max-h-[55dvh] xl:max-h-[calc(100vh-8rem)]">
                <CardHeader className="bg-background/80 z-10 flex flex-row items-center justify-between border-b p-4 pb-4 backdrop-blur-xs [.border-b]:pb-4">
                  <div>
                    <CardTitle className="text-xl font-medium">
                      Customize
                    </CardTitle>
                    <CardDescription className="mt-1 truncate text-xs">
                      {fileName || "Loading..."}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
                  <div className="flex flex-1 flex-col overflow-y-hidden">
                    <AnimatedTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />

                    <div className="flex-1 overflow-y-auto p-4">
                      {activeTab === "geometry" && <GeometryControls />}
                      {activeTab === "material" && <MaterialControls />}
                      {activeTab === "textures" && <TextureControls />}
                      {activeTab === "environment" && <EnvironmentControls />}
                      {activeTab === "background" && <BackgroundControls />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full gap-1.5">
            <ResizablePanel
              defaultSize={40}
              minSize={35}
              maxSize={80}
              className="flex flex-col xl:order-first xl:col-span-5">
              <Card className="flex h-fit w-full flex-col overflow-hidden border">
                <CardHeader className="bg-background/80 z-10 flex min-h-13 flex-row items-center justify-between border-b backdrop-blur-xs">
                  <div className="flex w-full items-center justify-between">
                    <CardTitle className="px-1 text-xl font-medium">
                      Customize
                    </CardTitle>
                    <span className="bg-muted text-muted-foreground mx-1 truncate rounded-sm px-1.5 py-0.5 text-xs">
                      {fileName || "Loading..."}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
                  <div className="flex flex-1 flex-col overflow-y-hidden">
                    <AnimatedTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />

                    <div className="flex-1 overflow-y-auto p-4">
                      {activeTab === "geometry" && <GeometryControls />}
                      {activeTab === "material" && <MaterialControls />}
                      {activeTab === "textures" && <TextureControls />}
                      {activeTab === "environment" && <EnvironmentControls />}
                      {activeTab === "background" && <BackgroundControls />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle className="hidden xl:flex" />
            <ResizablePanel
              defaultSize={58}
              minSize={30}
              maxSize={80}
              className="flex flex-col xl:order-last xl:col-span-7">
              <Card className="flex h-full w-full flex-col overflow-hidden border">
                {!isMobile && (
                  <CardHeader className="bg-background/80 z-10 flex min-h-13 flex-row items-center justify-between border-b backdrop-blur-xs">
                    <div className="flex w-full items-center justify-between">
                      <CardTitle className="px-1 text-xl font-medium">
                        Preview
                      </CardTitle>
                    </div>
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                resetEditor();
                                toast.success(
                                  "Editor settings reset to default",
                                );
                              }}
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
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                if (isFullscreen) {
                                  document.exitFullscreen();
                                } else if (previewContainerRef.current) {
                                  previewContainerRef.current.requestFullscreen();
                                }
                              }}
                              aria-label={
                                isFullscreen
                                  ? "Exit fullscreen"
                                  : "Enter fullscreen"
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
                      </div>
                    </TooltipProvider>
                  </CardHeader>
                )}
                <ModelViewport
                  svgData={svgData}
                  isMobile={isMobile}
                  isModelLoading={isModelLoading}
                  svgProcessingError={svgProcessingError}
                  isFullscreen={isFullscreen}
                  isFullscreenSupported={isFullscreenSupported}
                  isIOS={isIOS}
                  modelGroupRef={modelGroupRef}
                  modelRef={modelRef}
                  canvasRef={canvasRef}
                  containerRef={previewContainerRef}
                />
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {/* Mobile Controls Sheet */}
        {isMobile && (
          <div className="bg-background/98 border-border/50 h-[calc(100vh-8rem-40vh)] flex-shrink-0 border-t backdrop-blur-xl">
            <div className="h-full space-y-4 overflow-y-auto p-3">
              {activeMobileTab === "geometry" && <GeometryControls />}
              {activeMobileTab === "material" && <MaterialControls />}
              {activeMobileTab === "textures" && <TextureControls />}
              {activeMobileTab === "environment" && <EnvironmentControls />}
              {activeMobileTab === "background" && <BackgroundControls />}
            </div>
          </div>
        )}
      </div>
      <MobileTabBar
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
      />
    </main>
  );
}
