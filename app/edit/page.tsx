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

export default function EditPage() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("geometry");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    toast.success("RESET COMPLETE");
  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (previewContainerRef.current) {
      previewContainerRef.current.requestFullscreen();
    }
  };

  if (!isClientMounted) return null;

  return (
    <main className="flex h-screen w-full flex-col bg-black font-mono text-[14px] tracking-wide text-white uppercase md:flex-row">
      <EditManagers />

      {/* PREVIEW PANEL */}
      <div className="flex flex-1 flex-col md:border-r md:border-neutral-800">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-neutral-800 px-4 md:h-10">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-neutral-500 transition-colors hover:text-white"
              title="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-neutral-400">PREVIEW</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="text-neutral-500 transition-colors hover:text-white"
              title="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
            {isFullscreenSupported && (
              <button
                onClick={handleFullscreen}
                className="text-neutral-500 transition-colors hover:text-white"
                title="Fullscreen">
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            )}
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400 transition-colors hover:border-white hover:text-white md:hidden">
              EDIT
            </button>
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
                  <p className="text-red-500">ERROR</p>
                  <p className="mt-2 text-[12px] text-neutral-500">
                    {svgProcessingError}
                  </p>
                </div>
              ) : (
                <p className="animate-pulse text-neutral-500">LOADING...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS PANEL - Desktop */}
      <div className="hidden w-[280px] flex-col bg-black md:flex">
        {/* Header */}
        <div className="flex h-10 items-center justify-between border-b border-neutral-800 px-4">
          <span className="text-neutral-400">CONTROLS</span>
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
        <div className="border-t border-neutral-800">
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
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col bg-black md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header */}
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800 px-4">
                <span className="text-neutral-400">CONTROLS</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-neutral-500 transition-colors hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex-1 overflow-y-auto">
                <MinimalControls
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>

              {/* Export */}
              <div className="shrink-0 border-t border-neutral-800">
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
