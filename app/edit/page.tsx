"use client";

import { useRef, useEffect, useState, useSyncExternalStore } from "react";
import type * as THREE from "three";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
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
import { Logo } from "@/components/ui/logo";

// Detect Safari (all versions - desktop and mobile have WebGL issues)
const isSafari = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Edge/.test(ua);
};

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function EditPage() {
  const isClientMounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [activeSection, setActiveSection] = useState<string | null>("geometry");
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [safariDismissed, setSafariDismissed] = useState(false);
  const showSafariWarning = isClientMounted && isSafari();

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

  const handleSectionChange = (section: string | null) => {
    setActiveSection(section);
    if (section) setExportOpen(false);
  };

  const handleExportOpenChange = (open: boolean) => {
    setExportOpen(open);
    if (open) setActiveSection(null);
  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (previewContainerRef.current) {
      previewContainerRef.current.requestFullscreen();
    }
  };

  if (!isClientMounted) return null;

  // Safari warning screen
  if (showSafariWarning && !safariDismissed) {
    return (
      <main className="flex h-[100dvh] w-full items-center justify-center bg-[#101010] px-5 text-[14px] leading-6 text-[#a8a8a8]">
        <div className="w-full max-w-sm rounded-md border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <TriangleAlert className="mx-auto mb-5 size-5 text-white" />
          <h1 className="font-medium text-white">Safari is not supported</h1>
          <p className="mt-3">
            Safari has limited WebGL support which causes performance issues
            with 3D rendering.
          </p>
          <p className="mt-3">
            For the best experience, use{" "}
            <span className="text-white">Chrome</span> or{" "}
            <span className="text-white">Firefox</span>
          </p>
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-8 flex-1 rounded-md text-[14px]">
              Go back
            </Button>
            <Button
              onClick={() => setSafariDismissed(true)}
              className="h-8 flex-1 rounded-md text-[14px]">
              Continue anyway
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#101010] text-[14px] leading-5 text-[#a8a8a8]">
      <EditManagers />

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.05] px-2.5 sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Back to home"
            title="Back to home"
            className="size-8 rounded-md text-[#888] hover:bg-white/[0.06] hover:text-white">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2 text-white">
            <Logo className="size-4" />
            <span className="font-medium">Vecto3d</span>
          </div>
          <span className="mx-1 h-4 w-px bg-white/[0.08]" aria-hidden="true" />
          <span className="max-w-[38vw] truncate text-[#777] sm:max-w-[280px]">
            {fileName || "Untitled.svg"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            aria-label="Reset model"
            title="Reset model"
            className="size-8 rounded-md text-[#888] hover:bg-white/[0.06] hover:text-white">
            <RotateCcw className="size-4" />
          </Button>
          {isFullscreenSupported ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="size-8 rounded-md text-[#888] hover:bg-white/[0.06] hover:text-white">
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            className="ml-1 h-8 rounded-md px-3 text-[14px] md:hidden">
            Controls
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <section
          ref={previewContainerRef}
          aria-label="3D preview"
          className="relative min-h-0 flex-1 cursor-grab overflow-hidden rounded-md border border-white/[0.06] bg-[#151515] active:cursor-grabbing">
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
                <div className="max-w-sm px-5 text-center">
                  <p className="font-medium text-white">Something went wrong</p>
                  <p className="mt-2 text-[#777]">{svgProcessingError}</p>
                </div>
              ) : (
                <p className="animate-pulse text-[#777]">Loading…</p>
              )}
            </div>
          )}

          {isFullscreen ? (
            <div className="absolute top-3 right-3 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                aria-label="Exit fullscreen"
                title="Exit fullscreen"
                className="size-8 rounded-md border border-white/10 bg-[#101010]/80 text-[#aaa] backdrop-blur-md hover:bg-[#101010] hover:text-white">
                <Minimize2 className="size-4" />
              </Button>
            </div>
          ) : null}
        </section>

        <aside className="hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-md border border-white/[0.06] bg-[#121212] md:flex">
          <div className="flex h-10 shrink-0 items-center border-b border-white/[0.05] px-3.5">
            <span className="font-medium text-white">Controls</span>
          </div>
          <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
            <MinimalControls
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>
          <div className="shrink-0 border-t border-white/[0.05]">
            <MinimalExport
              isOpen={exportOpen}
              onOpenChange={handleExportOpenChange}
              fileName={fileName}
              modelGroupRef={modelGroupRef}
              canvasRef={canvasRef}
            />
          </div>
        </aside>
      </div>

      <AnimatePresence initial={false}>
        {mobileMenuOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Editor controls"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-xl border-t border-white/[0.08] bg-[#121212]/95 backdrop-blur-xl md:hidden"
              initial={{ transform: "translateY(100%)" }}
              animate={{ transform: "translateY(0%)" }}
              exit={{ transform: "translateY(100%)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.05] px-3.5">
                <div className="flex items-center gap-3">
                  <span className="h-1 w-8 rounded-full bg-white/15" />
                  <span className="font-medium text-white">Controls</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close controls"
                  className="size-8 rounded-md text-[#888] hover:bg-white/[0.06] hover:text-white">
                  <X className="size-4" />
                </Button>
              </div>

              <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
                <MinimalControls
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
              <div className="shrink-0 border-t border-white/[0.05]">
                <MinimalExport
                  isOpen={exportOpen}
                  onOpenChange={handleExportOpenChange}
                  fileName={fileName}
                  modelGroupRef={modelGroupRef}
                  canvasRef={canvasRef}
                />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
