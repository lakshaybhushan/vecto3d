"use client";

import { useRef, useEffect, useMemo, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  RotateCcw,
  Box,
  Palette,
  Image,
  Mountain,
  Monitor,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type * as THREE from "three";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ui/theme-toggle";
import dynamic from "next/dynamic";

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
import { ExportButtons } from "@/components/forms/export-buttons";

import { useDebounce } from "@/hooks/use-debounce";
import {
  useMobileDetection,
  useIOSDetection,
  useFullscreenSupport,
} from "@/hooks/use-mobile-detection";
import { useTexturePreloader } from "@/hooks/use-texture-preloader";
import { useEditorStore } from "@/lib/store";
import { DARK_MODE_COLOR, LIGHT_MODE_COLOR } from "@/lib/constants";
import AnimatedLogo from "@/components/ui/animated-logo";
import { memoryManager } from "@/lib/memory-manager";

// Dynamically import ModelPreview with SSR disabled to prevent ProgressEvent errors
const ModelPreview = dynamic(
  () => import("@/components/previews/model-preview"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card flex h-full w-full flex-col items-center justify-center">
        <div className="flex max-w-xs flex-col items-center gap-4 px-4 text-center">
          <div className="relative h-20 w-20">
            <div className="bg-background/20 absolute inset-0 animate-pulse rounded-full"></div>
            <div className="bg-background/40 absolute inset-4 animate-pulse rounded-full [animation-delay:200ms]"></div>
            <AnimatedLogo className="absolute inset-0 h-full w-full" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Loading 3D preview...</p>
            <p className="text-muted-foreground text-xs">
              Initializing Three.js components
            </p>
          </div>
        </div>
      </div>
    ),
  },
);

function useThemeBackgroundColor() {
  const { resolvedTheme } = useTheme();

  return useMemo(() => {
    if (resolvedTheme === "dark") return DARK_MODE_COLOR;
    return LIGHT_MODE_COLOR;
  }, [resolvedTheme]);
}

const ModelLoadingState = ({ message }: { message: string }) => (
  <div className="bg-card flex h-full w-full flex-col items-center justify-center">
    <div className="flex max-w-xs flex-col items-center gap-4 px-4 text-center">
      <div className="relative h-20 w-20">
        <div className="bg-background/20 absolute inset-0 animate-pulse rounded-full"></div>
        <div className="bg-background/40 absolute inset-4 animate-pulse rounded-full [animation-delay:200ms]"></div>
        <AnimatedLogo className="absolute inset-0 h-full w-full" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-muted-foreground text-xs">
          This may take a moment for complex SVGs
        </p>
      </div>
    </div>
  </div>
);

const ModelErrorState = ({ error }: { error: string }) => (
  <div className="bg-destructive/5 flex h-full w-full items-center justify-center">
    <div className="max-w-sm p-6 text-center">
      <p className="text-destructive mb-2 font-medium">Error processing SVG</p>
      <p className="text-muted-foreground text-xs">{error}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  </div>
);

const SvgProcessingLogic = memo(() => {
  const svgData = useEditorStore((state) => state.svgData);
  const fileName = useEditorStore((state) => state.fileName);
  const setSvgData = useEditorStore((state) => state.setSvgData);
  const setFileName = useEditorStore((state) => state.setFileName);
  const setIsModelLoading = useEditorStore((state) => state.setIsModelLoading);
  const setIsHollowSvg = useEditorStore((state) => state.setIsHollowSvg);
  const resetEditor = useEditorStore((state) => state.resetEditor);

  const router = useRouter();
  const debouncedSvgData = useDebounce(svgData, 300);

  useEffect(() => {
    const storedSvgData = sessionStorage.getItem("vecto3d_svgData");
    const storedFileName = sessionStorage.getItem("vecto3d_fileName");

    if (!svgData && storedSvgData) {
      setSvgData(storedSvgData);
      setFileName(storedFileName || "");
      resetEditor();
    } else if (!svgData && !storedSvgData) {
      router.push("/");
    }
  }, [svgData, setSvgData, setFileName, resetEditor, router]);

  useEffect(() => {
    if (svgData) {
      sessionStorage.setItem("vecto3d_svgData", svgData);
      sessionStorage.setItem("vecto3d_fileName", fileName);
    }
  }, [svgData, fileName]);

  useEffect(() => {
    if (debouncedSvgData) {
      setIsModelLoading(true);
      setIsModelLoading(false);
    }
  }, [debouncedSvgData, setIsModelLoading]);

  useEffect(() => {
    if (!debouncedSvgData) return;

    const hasClosedPath =
      debouncedSvgData.includes("Z") || debouncedSvgData.includes("z");
    const hasMultiplePaths =
      (debouncedSvgData.match(/<path/g) || []).length > 1;
    const hasCircles = debouncedSvgData.includes("<circle");
    const hasEllipse = debouncedSvgData.includes("<ellipse");
    const hasRect = debouncedSvgData.includes("<rect");

    const isLikelyHollow =
      (hasClosedPath &&
        (hasMultiplePaths || hasCircles || hasEllipse || hasRect)) ||
      debouncedSvgData.toLowerCase().includes("smile") ||
      debouncedSvgData.toLowerCase().includes("face");

    setIsHollowSvg(isLikelyHollow);
  }, [debouncedSvgData, setIsHollowSvg]);

  return null;
});

SvgProcessingLogic.displayName = "SvgProcessingLogic";

const BackgroundThemeManager = memo(() => {
  const userSelectedBackground = useEditorStore(
    (state) => state.userSelectedBackground,
  );
  const setBackgroundColor = useEditorStore(
    (state) => state.setBackgroundColor,
  );
  const setSolidColorPreset = useEditorStore(
    (state) => state.setSolidColorPreset,
  );

  const { resolvedTheme } = useTheme();
  const themeBackgroundColor = useThemeBackgroundColor();

  useEffect(() => {
    if (!userSelectedBackground) {
      setBackgroundColor(themeBackgroundColor);
      setSolidColorPreset(resolvedTheme === "dark" ? "dark" : "light");
    }
  }, [
    resolvedTheme,
    themeBackgroundColor,
    userSelectedBackground,
    setBackgroundColor,
    setSolidColorPreset,
  ]);

  return null;
});

BackgroundThemeManager.displayName = "BackgroundThemeManager";

const HdriCleanupManager = memo(() => {
  const customHdriUrl = useEditorStore((state) => state.customHdriUrl);

  useEffect(() => {
    const urlToRevoke = customHdriUrl;
    return () => {
      if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [customHdriUrl]);

  return null;
});

HdriCleanupManager.displayName = "HdriCleanupManager";

const VibeModeManager = memo(() => {
  const environmentPreset = useEditorStore((state) => state.environmentPreset);
  const customHdriUrl = useEditorStore((state) => state.customHdriUrl);
  const useBloom = useEditorStore((state) => state.useBloom);
  const toggleVibeMode = useEditorStore((state) => state.toggleVibeMode);

  useEffect(() => {
    if (environmentPreset === "custom" && customHdriUrl && useBloom) {
      toggleVibeMode(false);
      toast.info(
        "Vibe Mode has been disabled because you selected a custom image",
        {
          duration: 3000,
        },
      );
    }
  }, [environmentPreset, customHdriUrl, useBloom, toggleVibeMode]);

  return null;
});

VibeModeManager.displayName = "VibeModeManager";

const MobileTabBar = memo(
  ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => {
    const tabs = [
      { id: "geometry", label: "Geometry", icon: Box },
      { id: "material", label: "Material", icon: Palette },
      { id: "textures", label: "Textures", icon: Image },
      { id: "environment", label: "Environment", icon: Mountain },
      { id: "background", label: "Background", icon: Monitor },
    ];

    return (
      <div className="bg-background/98 border-border/50 flex-shrink-0 border-t backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}>
                <Icon className={isActive ? "h-6 w-6" : "h-5 w-5"} />
                <span
                  className={`text-[9px] leading-none font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

MobileTabBar.displayName = "MobileTabBar";

export default function EditPage() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("geometry");
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

  const renderModelPreview = () => {
    if (!isClientMounted) {
      return <ModelLoadingState message="Initializing editor..." />;
    }
    if (svgProcessingError)
      return <ModelErrorState error={svgProcessingError} />;
    if (isModelLoading) {
      return (
        <ModelLoadingState message="Reconstructing your 3D model geometry..." />
      );
    }

    return (
      <div className="h-full w-full md:overflow-hidden">
        <ModelPreview
          svgData={svgData!}
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

  if (!isClientMounted) {
    return null;
  }

  return (
    <main className="bg-background safari-fix relative flex h-screen w-full flex-col overflow-hidden">
      <SvgProcessingLogic />
      <BackgroundThemeManager />
      <HdriCleanupManager />
      <VibeModeManager />

      <header
        className={`bg-background/80 z-20 w-full border-b border-dashed backdrop-blur-xs ${
          isMobile
            ? "bg-background/95 flex-shrink-0 backdrop-blur-xl"
            : "sticky top-0"
        }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size={isMobile ? "icon" : "sm"}
              onClick={handleBackToHome}
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
                        onClick={() => {
                          resetEditor();
                          toast.success("Editor settings reset to default");
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
                  {isFullscreenSupported && !isIOS && (
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
                <div
                  className="relative flex grow items-center justify-center"
                  ref={previewContainerRef}>
                  {renderModelPreview()}
                  {isFullscreen && (
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
                            container={previewContainerRef.current}>
                            Exit fullscreen
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
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
                  <Tabs
                    defaultValue="geometry"
                    className="flex flex-1 flex-col overflow-y-hidden">
                    <div className="border-b p-4">
                      <TabsList className="w-full text-xs">
                        <TabsTrigger value="geometry" className="text-sm">
                          <Box className="h-4 w-4 shrink-0" />
                          <span className="truncate">Geometry</span>
                        </TabsTrigger>
                        <TabsTrigger value="material" className="text-sm">
                          <Palette className="h-4 w-4 shrink-0" />
                          <span className="truncate">Material</span>
                        </TabsTrigger>
                        <TabsTrigger value="textures" className="text-sm">
                          <Image className="h-4 w-4 shrink-0" />
                          <span className="truncate">Textures</span>
                        </TabsTrigger>
                        <TabsTrigger value="environment" className="text-sm">
                          <Mountain className="h-4 w-4 shrink-0" />
                          <span className="truncate">Environment</span>
                        </TabsTrigger>
                        <TabsTrigger value="background" className="text-sm">
                          <Monitor className="h-4 w-4 shrink-0" />
                          <span className="truncate">Background</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      <TabsContent
                        value="geometry"
                        key="geometry"
                        className="mt-0">
                        <GeometryControls />
                      </TabsContent>

                      <TabsContent
                        value="material"
                        key="material"
                        className="mt-0">
                        <MaterialControls />
                      </TabsContent>

                      <TabsContent
                        value="textures"
                        key="textures"
                        className="mt-0">
                        <TextureControls />
                      </TabsContent>

                      <TabsContent
                        value="environment"
                        key="environment"
                        className="mt-0">
                        <EnvironmentControls />
                      </TabsContent>

                      <TabsContent
                        value="background"
                        key="background"
                        className="mt-0">
                        <BackgroundControls />
                      </TabsContent>
                    </div>
                  </Tabs>
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
                  <Tabs
                    defaultValue="geometry"
                    className="flex flex-1 flex-col overflow-y-hidden">
                    <div className="border-b p-4">
                      <TabsList className="w-full text-xs">
                        <TabsTrigger value="geometry" className="text-sm">
                          <Box className="h-4 w-4 shrink-0" />
                          <span className="truncate">Geometry</span>
                        </TabsTrigger>
                        <TabsTrigger value="material" className="text-sm">
                          <Palette className="h-4 w-4 shrink-0" />
                          <span className="truncate">Material</span>
                        </TabsTrigger>
                        <TabsTrigger value="textures" className="text-sm">
                          <Image className="h-4 w-4 shrink-0" />
                          <span className="truncate">Textures</span>
                        </TabsTrigger>
                        <TabsTrigger value="environment" className="text-sm">
                          <Mountain className="h-4 w-4 shrink-0" />
                          <span className="truncate">Environment</span>
                        </TabsTrigger>
                        <TabsTrigger value="background" className="text-sm">
                          <Monitor className="h-4 w-4 shrink-0" />
                          <span className="truncate">Background</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      <TabsContent
                        value="geometry"
                        key="geometry"
                        className="mt-0">
                        <GeometryControls />
                      </TabsContent>

                      <TabsContent
                        value="material"
                        key="material"
                        className="mt-0">
                        <MaterialControls />
                      </TabsContent>

                      <TabsContent
                        value="textures"
                        key="textures"
                        className="mt-0">
                        <TextureControls />
                      </TabsContent>

                      <TabsContent
                        value="environment"
                        key="environment"
                        className="mt-0">
                        <EnvironmentControls />
                      </TabsContent>

                      <TabsContent
                        value="background"
                        key="background"
                        className="mt-0">
                        <BackgroundControls />
                      </TabsContent>
                    </div>
                  </Tabs>
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
                <div className="relative grow" ref={previewContainerRef}>
                  {renderModelPreview()}
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
                            container={previewContainerRef.current}>
                            Exit fullscreen
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
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
