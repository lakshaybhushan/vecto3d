"use client";

import { useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Maximize2, Minimize2, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import React from "react";
import { ModeToggle } from "@/components/ui/theme-toggle";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GeometryControls } from "@/components/controls/geometry-controls";
import { MaterialControls } from "@/components/controls/material-controls";
import { EnvironmentControls } from "@/components/controls/environment-controls";
import { BackgroundControls } from "@/components/controls/background-controls";
import { ExportButtons } from "@/components/export-buttons";
import { EditorMobileWarning } from "@/components/mobile-warning";

import { useDebounce } from "@/hooks/use-debounce";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { NotAScam } from "@/components/not-a-scam";
import { useEditorStore } from "@/lib/store";
import { DARK_MODE_COLOR, LIGHT_MODE_COLOR } from "@/lib/constants";
// import { BackIcon } from "@/components/ui/ui-icons";
import AnimatedLogo from "@/components/ui/animated-logo";
import { ModelPreview } from "@/components/model-preview";

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

export default function EditPage() {
  const {
    svgData,
    fileName,
    isModelLoading,
    svgProcessingError,
    depth,
    isHollowSvg,
    modelRotationY,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    bevelSegments,
    // bevelPreset,
    customColor,
    useCustomColor,
    // materialPreset,
    roughness,
    metalness,
    clearcoat,
    transmission,
    envMapIntensity,
    useEnvironment,
    environmentPreset,
    customHdriUrl,
    userSelectedBackground,
    backgroundColor,
    // solidColorPreset,
    autoRotate,
    autoRotateSpeed,
    isFullscreen,
    useBloom,
    bloomIntensity,
    bloomMipmapBlur,
    // Actions
    setSvgData,
    setFileName,
    setIsModelLoading,
    setSvgProcessingError,
    setIsHollowSvg,
    setBackgroundColor,
    setSolidColorPreset,
    setIsFullscreen,
    toggleVibeMode,
  } = useEditorStore();

  const modelRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const {
    isMobile,
    continueOnMobile,
    handleContinueOnMobile,
    clearMobilePreference,
  } = useMobileDetection();

  const themeBackgroundColor = useThemeBackgroundColor();
  const [hasMounted, setHasMounted] = React.useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // cleanup
  useEffect(() => {
    // Store the URL in a variable to ensure the cleanup function uses the correct value
    const urlToRevoke = customHdriUrl;
    return () => {
      if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [customHdriUrl]);

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

  // debounce expensive operations
  const debouncedSvgData = useDebounce(svgData, 300);

  // update loading state when svg data changes
  useEffect(() => {
    if (debouncedSvgData) {
      setIsModelLoading(true);
      // simulate processing time for complex svg
      const timer = setTimeout(() => {
        setIsModelLoading(false);
      }, 800);

      return () => clearTimeout(timer);
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

  useEffect(() => {
    setIsModelLoading(true);
    const savedSvgData = localStorage.getItem("svgData");
    const savedFileName = localStorage.getItem("fileName");

    if (savedSvgData) {
      setSvgData(savedSvgData);
    } else {
      setIsModelLoading(false);

      if (!savedSvgData) {
        router.push("/");
      }
    }

    if (savedFileName) {
      setFileName(savedFileName);
    }
  }, [router, setSvgData, setFileName, setIsModelLoading]);

  const handleBackToHome = () => {
    clearMobilePreference();
    router.push("/");
  };

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, [setIsFullscreen]);

  const renderModelPreview = () => {
    if (!svgData) {
      return <ModelLoadingState message="Waiting for SVG data..." />;
    }

    if (isModelLoading) {
      return <ModelLoadingState message="Generating 3D model..." />;
    }

    if (svgProcessingError) {
      return <ModelErrorState error={svgProcessingError} />;
    }

    return (
      <div className="h-full w-full md:overflow-hidden">
        <ModelPreview
          svgData={svgData}
          depth={depth}
          modelRotationY={modelRotationY}
          modelGroupRef={modelGroupRef}
          modelRef={modelRef}
          // Geometry settings
          bevelEnabled={bevelEnabled}
          bevelThickness={bevelThickness}
          bevelSize={bevelSize}
          bevelSegments={bevelSegments}
          isHollowSvg={isHollowSvg}
          spread={0}
          // Material settings
          useCustomColor={useCustomColor}
          customColor={customColor}
          roughness={roughness}
          metalness={metalness}
          clearcoat={clearcoat}
          transmission={transmission}
          envMapIntensity={envMapIntensity}
          // Environment settings
          backgroundColor={backgroundColor}
          useEnvironment={useEnvironment}
          environmentPreset={environmentPreset}
          customHdriUrl={customHdriUrl}
          // Rendering options
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          useBloom={useBloom}
          bloomIntensity={bloomIntensity}
          bloomMipmapBlur={bloomMipmapBlur}
          isMobile={isMobile}
          onLoadStart={() => setIsModelLoading(true)}
          onLoadComplete={() => setIsModelLoading(false)}
          onError={(error) => {
            setSvgProcessingError(error.message || "Failed to process SVG");
            setIsModelLoading(false);
          }}
        />
      </div>
    );
  };

  return (
    <main className="bg-background relative flex h-screen w-full flex-col md:overflow-hidden">
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b border-dashed backdrop-blur-xs">
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
            <NotAScam />
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
                            <Minimize2
                              className={`h-4 w-4 ${
                                hasMounted &&
                                backgroundColor === "#FFFFFF" &&
                                resolvedTheme === "dark"
                                  ? "text-black"
                                  : "text-primary"
                              }`}
                            />
                          ) : (
                            <Maximize2
                              className={`h-4 w-4 ${
                                hasMounted &&
                                backgroundColor === "#FFFFFF" &&
                                resolvedTheme === "dark"
                                  ? "text-black"
                                  : "text-primary"
                              }`}
                            />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        align="center"
                        sideOffset={10}
                        className="z-99999 px-4 py-2 text-xs shadow-md">
                        Performance may be affected
                      </TooltipContent>
                    </Tooltip>
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
                              className={`pointer-events-auto absolute top-6 right-6 bg-transparent ${
                                backgroundColor === "#000000" || useBloom
                                  ? "hover:bg-white/10"
                                  : backgroundColor === "#FFFFFF" &&
                                      resolvedTheme === "dark"
                                    ? "hover:bg-black/10"
                                    : "hover:bg-background/80"
                              } backdrop-blur-xs`}>
                              <Minimize2
                                className={`h-4 w-4 ${
                                  hasMounted &&
                                  (backgroundColor === "#000000" || useBloom)
                                    ? "text-white"
                                    : hasMounted &&
                                        backgroundColor === "#FFFFFF" &&
                                        resolvedTheme === "dark"
                                      ? "text-black"
                                      : "text-primary/80"
                                }`}
                              />
                              <span className="sr-only">Exit fullscreen</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            align="center"
                            sideOffset={10}
                            className="px-4 py-2 text-xs shadow-md">
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
              <Card className="flex h-fit w-full flex-col overflow-hidden border">
                <CardHeader className="bg-background/80 z-10 flex flex-row items-center justify-between border-b p-4 pb-4 backdrop-blur-xs [.border-b]:pb-4">
                  <div>
                    <CardTitle className="text-xl font-medium">
                      Customize
                    </CardTitle>
                    <CardDescription className="mt-1 truncate text-xs">
                      {fileName}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Tabs defaultValue="geometry">
                    <TabsList className="mb-4 flex w-full justify-between overflow-x-auto">
                      <TabsTrigger value="geometry" className="flex-1">
                        Geometry
                      </TabsTrigger>
                      <TabsTrigger value="material" className="flex-1">
                        Material
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
