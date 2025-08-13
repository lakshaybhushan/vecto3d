import { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusIcon } from "lucide-react";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEditorStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized,
    16,
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function adjustColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = clamp(Math.round(r + 255 * amount), 0, 255);
  const ng = clamp(Math.round(g + 255 * amount), 0, 255);
  const nb = clamp(Math.round(b + 255 * amount), 0, 255);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const sr = r / 255;
  const sg = g / 255;
  const sb = b / 255;
  const R = sr <= 0.03928 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4);
  const G = sg <= 0.03928 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4);
  const B = sb <= 0.03928 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function buildHorizonGradient(hex: string) {
  const base = hex;
  const sky = adjustColor(base, 0.12);
  const mid = adjustColor(base, 0.02);
  const ground = adjustColor(base, -0.22);
  return `linear-gradient(180deg, ${sky} 0%, ${mid} 48%, ${ground} 100%)`;
}

function buildVignetteOverlay(hex: string) {
  return `radial-gradient(120% 100% at 50% 0%, ${withAlpha("#000000", 0.14)} 0%, transparent 52%), radial-gradient(80% 60% at 50% 100%, ${withAlpha("#000000", 0.18)} 0%, transparent 68%)`;
}

function buildSphereGradient(hex: string) {
  const fill = withAlpha(hex, 0.85);
  const highlight = withAlpha("#ffffff", 0.65);
  const highlightSoft = withAlpha("#ffffff", 0.18);
  const rim = withAlpha(hex, 0.8);
  const body = withAlpha(hex, 0.55);
  const base = withAlpha("#000000", 0.18);
  return [
    `radial-gradient(circle at 30% 28%, ${highlight} 0%, ${highlightSoft} 22%, transparent 36%)`,
    `radial-gradient(circle at 70% 70%, ${rim} 0%, ${body} 45%, transparent 80%)`,
    `radial-gradient(circle at 50% 90%, ${base} 0%, transparent 60%)`,
    `radial-gradient(circle at 50% 50%, ${fill} 0%, ${fill} 100%)`,
  ].join(", ");
}

export function EnvironmentControls() {
  const useEnvironment = useEditorStore((state) => state.useEnvironment);
  const setUseEnvironment = useEditorStore((state) => state.setUseEnvironment);
  const environmentPreset = useEditorStore((state) => state.environmentPreset);
  const setEnvironmentPreset = useEditorStore(
    (state) => state.setEnvironmentPreset,
  );
  const customHdriUrl = useEditorStore((state) => state.customHdriUrl);
  const setCustomHdriUrl = useEditorStore((state) => state.setCustomHdriUrl);
  const useBloom = useEditorStore((state) => state.useBloom);
  const bloomIntensity = useEditorStore((state) => state.bloomIntensity);
  const setBloomIntensity = useEditorStore((state) => state.setBloomIntensity);
  const bloomMipmapBlur = useEditorStore((state) => state.bloomMipmapBlur);
  const setBloomMipmapBlur = useEditorStore(
    (state) => state.setBloomMipmapBlur,
  );
  const modelRotationY = useEditorStore((state) => state.modelRotationY);
  const setModelRotationY = useEditorStore((state) => state.setModelRotationY);
  const toggleVibeMode = useEditorStore((state) => state.toggleVibeMode);

  const hdriFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!useEnvironment && useBloom) {
      toggleVibeMode(false);
    }
  }, [useEnvironment, useBloom, toggleVibeMode]);

  const handleHdriFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    const fileType = file.type.toLowerCase();
    const isJpg = fileType === "image/jpeg" || fileType === "image/jpg";
    const isPng = fileType === "image/png";
    const isHdr =
      fileType === "image/hdr" || fileType === "application/octet-stream";

    if (!isJpg && !isPng && !isHdr) {
      toast.error(
        "Unsupported file format: Only JPG, PNG, and HDR are supported",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large: Image must be smaller than 10MB");
      return;
    }

    if (customHdriUrl && customHdriUrl.startsWith("blob:")) {
      URL.revokeObjectURL(customHdriUrl);
    }

    try {
      const objectURL = URL.createObjectURL(file);
      setCustomHdriUrl(objectURL);
      setEnvironmentPreset("custom");
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error creating object URL:", error);
      toast.error("Failed to process the image file");
    }

    e.target.value = "";
  };

  const handlePresetChange = (preset: string) => {
    setEnvironmentPreset(preset);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="useEnvironment" className="text-sm font-medium">
            Use Environment Lighting
          </Label>
          <p className="text-muted-foreground text-xs">
            Enable environment lighting for the 3D model.
          </p>
        </div>
        <Switch
          id="useEnvironment"
          checked={useEnvironment}
          onCheckedChange={(checked) => setUseEnvironment(checked as boolean)}
        />
      </div>

      {useEnvironment && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Presets</Label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {ENVIRONMENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    environmentPreset === preset.name
                      ? "bg-secondary"
                      : "hover:bg-secondary/50 hover:border-secondary"
                  }`}
                  onClick={() => handlePresetChange(preset.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handlePresetChange(preset.name);
                    }
                  }}
                  aria-label={preset.label}
                  aria-pressed={environmentPreset === preset.name}
                  type="button">
                  <div className="relative flex h-full flex-col">
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                      <div className="relative z-10 mb-0 flex items-center justify-center">
                        <div
                          className="h-12 w-12 rounded-full border border-white/20 shadow-md shadow-black/20 sm:h-14 sm:w-14"
                          style={{
                            background: buildSphereGradient(preset.color),
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-primary/10 px-2 py-1.5 text-center">
                      <p className="text-foreground text-xs leading-tight font-medium">
                        {preset.label}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <button
                key="custom-preset"
                className={`group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  environmentPreset === "custom"
                    ? "bg-secondary"
                    : "hover:bg-secondary/50 hover:border-secondary"
                }`}
                onClick={() => {
                  if (customHdriUrl) {
                    setEnvironmentPreset("custom");
                  } else {
                    hdriFileInputRef.current?.click();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (customHdriUrl) {
                      setEnvironmentPreset("custom");
                    } else {
                      hdriFileInputRef.current?.click();
                    }
                  }
                }}
                aria-label={customHdriUrl ? "Custom" : "Upload custom image"}
                aria-pressed={environmentPreset === "custom"}
                type="button">
                <input
                  ref={hdriFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleHdriFileChange}
                />
                {customHdriUrl ? (
                  <div className="relative flex h-full flex-col">
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                      <div className="relative z-10 mb-0 flex items-center justify-center">
                        <div
                          className="h-12 w-12 rounded-full border border-white/20 shadow-md shadow-black/20 sm:h-14 sm:w-14"
                          style={{ background: buildSphereGradient("#9CA3AF") }}
                        />
                      </div>
                    </div>
                    <div className="bg-primary/10 px-2 py-1.5 text-center">
                      <p className="text-foreground text-xs leading-tight font-medium">
                        Custom
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-full flex-col">
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                      <div className="border-muted-foreground/30 bg-muted/20 relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed sm:h-14 sm:w-14">
                        <PlusIcon className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                    </div>
                    <div className="bg-primary/10 px-2 py-1.5 text-center">
                      <p className="text-foreground text-xs leading-tight font-medium">
                        Custom
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {environmentPreset === "custom" && customHdriUrl && (
            <Alert className="bg-muted/50">
              <AlertDescription className="flex items-center text-xs">
                <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
                <div className="flex w-full items-center justify-between">
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Your image will be used for reflections in the 3D model.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => hdriFileInputRef.current?.click()}>
                    Change Image
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 border-t pt-4">
            {environmentPreset === "custom" && customHdriUrl ? (
              <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3">
                <Label
                  htmlFor="vibe-mode-disabled"
                  className="text-muted-foreground">
                  Vibe Mode
                </Label>
                <p className="text-muted-foreground text-xs">
                  Unavailable with custom images
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="vibe-mode" className="text-sm font-medium">
                    Vibe Mode
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Enable a cinematic bloom effect.
                  </p>
                </div>
                <Switch
                  id="vibe-mode"
                  checked={useBloom}
                  onCheckedChange={toggleVibeMode}
                />
              </div>
            )}

            {useBloom && (
              <motion.div
                className="bg-muted/20 border-primary/20 mt-2 space-y-4 rounded-md border p-4"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                <div className="space-y-4">
                  <Label
                    htmlFor="bloomIntensity"
                    className="flex items-center justify-between">
                    <span>Bloom Intensity</span>
                    <span className="text-primary font-mono">
                      {bloomIntensity.toFixed(2)}
                    </span>
                  </Label>
                  <Slider
                    id="bloomIntensity"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={[bloomIntensity]}
                    onValueChange={(value) => setBloomIntensity(value[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="bloomMipmapBlur"
                    checked={bloomMipmapBlur}
                    onCheckedChange={(checked) =>
                      setBloomMipmapBlur(checked as boolean)
                    }
                  />

                  <Label htmlFor="bloomMipmapBlur">Smooth Bloom</Label>
                </div>

                <div className="border-primary/10 space-y-2 border-t pt-3">
                  <Label
                    htmlFor="modelRotation"
                    className="flex justify-between">
                    <span>Rotate Model</span>
                    <span className="text-primary font-mono">
                      {(modelRotationY * (180 / Math.PI)).toFixed(0)}°
                    </span>
                  </Label>
                  <Slider
                    id="modelRotation"
                    min={0}
                    max={2 * Math.PI}
                    step={Math.PI / 12}
                    value={[modelRotationY]}
                    onValueChange={(value) => setModelRotationY(value[0])}
                    className="py-1"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
