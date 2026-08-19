"use client";

import { useRef, useEffect, useState } from "react";
import type * as THREE from "three";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Maximize2, Minimize2, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useEditorStore } from "@/lib/store";
import {
  useMobileDetection,
  useFullscreenSupport,
} from "@/hooks/use-mobile-detection";
import { useTexturePreloader } from "@/hooks/use-texture-preloader";
import { memoryManager } from "@/lib/memory-manager";

import { ModelPreview } from "@/components/previews/model-preview";
import { EditManagers } from "@/components/edit/edit-managers";
import { MinimalControls } from "@/components/edit/minimal-controls";
import { MinimalExport } from "@/components/edit/minimal-export";
import { Button } from "@/components/ui/button";

// Detect Safari (all versions - desktop and mobile have WebGL issues)
const isSafari = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Edge/.test(ua);
};

export default function EditPage() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("geometry");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSafariWarning, setShowSafariWarning] = useState(false);
  const [safariDismissed, setSafariDismissed] = useState(false);

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
  const isFullscreenSupported = useFullscreenSupport();

  useTexturePreloader(true);

  useEffect(() => {
    setIsClientMounted(true);
    setShowSafariWarning(isSafari());

    const modelGroup = modelGroupRef.current;
    const model = modelRef.current;

    if (modelGroup) memoryManager.track(modelGroup);
    if (model) memoryManager.track(model);

    return () => {
      if (modelGroup) memoryManager.untrack(modelGroup);
      if (model) memoryManager.untrack(model);

      const currentPath = window.location.pathname;
      if (currentPath !== "/edit") {
        sessionStorage.removeItem("vecto3d_svgData");
        sessionStorage.removeItem("vecto3d_fileName");
        memoryManager.scheduleCleanup();
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setIsFullscreen]);

  const handleBack = () => {
    clearMobilePreference();
    sessionStorage.removeItem("vecto3d_svgData");
    sessionStorage.removeItem("vecto3d_fileName");
    router.push("/");
  };

  const handleReset = () => {
    resetEditor();
    toast.success("Reset complete");
  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (previewContainerRef.current) {
      previewContainerRef.current.requestFullscreen();
    }
  };

  if (!isClientMounted) return null;

  // Safari mobile warning screen
  if (showSafariWarning && !safariDismissed) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center bg-black px-6 text-[14px] text-white">
        <div className="max-w-sm text-center">
          <div className="mb-6 text-2xl">⚠</div>
          <h1 className="mb-4 text-lg font-medium">Safari is not supported</h1>
          <p className="mb-8 leading-relaxed text-neutral-500">
            Safari has limited WebGL support which causes performance issues
            with 3D rendering.
          </p>
          <p className="mb-8 text-neutral-400">
            For the best experience, use{" "}
            <span className="text-white">Chrome</span> or{" "}
            <span className="text-white">Firefox</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleBack} className="w-full">
              Go back
            </Button>
            <Button
              variant="outline"
              onClick={() => setSafariDismissed(true)}
              className="w-full">
              Continue anyway
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col bg-black text-[14px] text-white md:flex-row">
      <EditManagers />

      {/* PREVIEW PANEL */}
      <div className="flex flex-1 flex-col md:border-r md:border-white/[0.08]">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-4 md:h-11">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              title="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-neutral-300">Preview</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            {isFullscreenSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                title="Fullscreen">
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            {/* Mobile menu toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden">
              Edit
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div ref={previewContainerRef} className="relative flex-1 bg-black">
          {svgData && !isModelLoading && !svgProcessingError ? (
            <ModelPreview
              svgData={svgData}
              modelGroupRef={modelGroupRef}
              modelRef={modelRef}
              isMobile={isMobile}
              canvasRef={canvasRef}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {svgProcessingError ? (
                <div className="text-center">
                  <p className="text-red-400">Something went wrong</p>
                  <p className="mt-2 text-[12px] text-neutral-500">
                    {svgProcessingError}
                  </p>
                </div>
              ) : (
                <p className="animate-pulse text-neutral-500">Loading…</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS PANEL - Desktop */}
      <div className="hidden w-[300px] flex-col bg-black md:flex">
        {/* Header */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] px-4">
          <span className="font-medium text-neutral-300">Controls</span>
          <span className="max-w-[120px] truncate text-[12px] text-neutral-600">
            {fileName || "..."}
          </span>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto">
          <MinimalControls
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Export */}
        <div className="border-t border-white/[0.08]">
          <MinimalExport
            fileName={fileName}
            modelGroupRef={modelGroupRef}
            canvasRef={canvasRef}
          />
        </div>
      </div>

      {/* CONTROLS PANEL - Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/80 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-lg border-t border-white/10 bg-neutral-950 md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
              {/* Header */}
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
                <span className="font-medium text-neutral-300">Controls</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close controls">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Controls */}
              <div className="flex-1 overflow-y-auto">
                <MinimalControls
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>

              {/* Export */}
              <div className="shrink-0 border-t border-white/[0.08]">
                <MinimalExport
                  fileName={fileName}
                  modelGroupRef={modelGroupRef}
                  canvasRef={canvasRef}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
