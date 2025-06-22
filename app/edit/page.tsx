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
import { Maximize2, Minimize2, ChevronLeft, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EditorMobileWarning } from "@/components/modals/mobile-warning";

import { useDebounce } from "@/hooks/use-debounce";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
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

export default function EditPage() {
  const [isClientMounted, setIsClientMounted] = useState(false);
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

  const router = useRouter();
  const {
    isMobile,
    continueOnMobile,
    handleContinueOnMobile,
    clearMobilePreference,
  } = useMobileDetection();

  // Initialize texture preloader
  useTexturePreloader(true);

  useEffect(() => {
    setIsClientMounted(true);

    // Track model refs with memory manager
    if (modelGroupRef.current) {
      memoryManager.track(modelGroupRef.current);
    }
    if (modelRef.current) {
      memoryManager.track(modelRef.current);
    }

    // Cleanup session storage when component unmounts (user navigates away)
    return () => {
      // Cleanup tracked models
      if (modelGroupRef.current) {
        memoryManager.untrack(modelGroupRef.current);
      }
      if (modelRef.current) {
        memoryManager.untrack(modelRef.current);
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
    <main className="bg-background relative flex h-screen w-full flex-col lg:overflow-hidden">
      {/* Include the separated logic components */}
      <SvgProcessingLogic />
      <BackgroundThemeManager />
      <HdriCleanupManager />
      <VibeModeManager />

      <header className="bg-background/80 sticky top-0 z-20 w-full border-b border-dashed backdrop-blur-xs">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHome}
              aria-label="Back to home">
              <ChevronLeft className="-ml-1 h-4 w-4" />
              <span className="-ml-0.5 hidden sm:inline">Home</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {svgData && (
              <ExportButtons
                fileName={fileName}
                modelGroupRef={modelGroupRef}
              />
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 px-8 py-8">
        {isMobile && !continueOnMobile ? (
          <EditorMobileWarning
            onContinue={handleContinueOnMobile}
            onReturn={handleBackToHome}
          />
        ) : (
          <div
            key="editor-content"
            className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="col relative order-first h-[60dvh] overflow-hidden lg:order-last lg:col-span-3 lg:h-[calc(100vh-8rem)]">
              <Card className="flex h-full w-full flex-col overflow-hidden border">
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

                <div className="relative grow" ref={previewContainerRef}>
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
            <div className="order-last space-y-6 lg:order-first lg:col-span-2">
              <Card className="flex max-h-[60dvh] w-full flex-col overflow-hidden border lg:max-h-[calc(100vh-8rem)]">
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
                <CardContent className="flex-1 overflow-hidden p-4">
                  <Tabs defaultValue="geometry">
                    <TabsList className="mb-4 flex w-full justify-between overflow-x-auto">
                      <TabsTrigger value="geometry" className="flex-1">
                        Geometry
                      </TabsTrigger>
                      <TabsTrigger value="material" className="flex-1">
                        Material
                      </TabsTrigger>
                      <TabsTrigger value="textures" className="flex-1">
                        Textures
                      </TabsTrigger>
                      <TabsTrigger value="environment" className="flex-1">
                        Environment
                      </TabsTrigger>
                      <TabsTrigger value="background" className="flex-1">
                        Background
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="geometry" key="geometry">
                      <GeometryControls />
                    </TabsContent>

                    <TabsContent value="material" key="material">
                      <MaterialControls />
                    </TabsContent>

                    <TabsContent value="textures" key="textures">
                      <TextureControls />
                    </TabsContent>

                    <TabsContent value="environment" key="environment">
                      <EnvironmentControls />
                    </TabsContent>

                    <TabsContent value="background" key="background">
                      <BackgroundControls />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
