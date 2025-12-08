"use client";

import { memo, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useEditorStore } from "@/lib/store";
import { DARK_MODE_COLOR, LIGHT_MODE_COLOR } from "@/lib/constants";

function useThemeBackgroundColor() {
  const { resolvedTheme } = useTheme();
  return useMemo(() => {
    if (resolvedTheme === "dark") return DARK_MODE_COLOR;
    return LIGHT_MODE_COLOR;
  }, [resolvedTheme]);
}

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
        { duration: 3000 },
      );
    }
  }, [environmentPreset, customHdriUrl, useBloom, toggleVibeMode]);

  return null;
});

VibeModeManager.displayName = "VibeModeManager";

export const EditManagers = memo(() => {
  return (
    <>
      <SvgProcessingLogic />
      <BackgroundThemeManager />
      <HdriCleanupManager />
      <VibeModeManager />
    </>
  );
});

EditManagers.displayName = "EditManagers";
