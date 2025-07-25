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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      {/* <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-sm">
            Applies to image exports only.
          </p>
        </AlertDescription>
      </Alert> */}

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
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-5 md:space-y-0">
              {ENVIRONMENT_PRESETS.map((preset) => (
                <TooltipProvider key={preset.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 sm:aspect-square sm:w-auto ${
                          environmentPreset === preset.name
                            ? "bg-secondary"
                            : "hover:bg-secondary/50 hover:border-secondary"
                        }`}
                        onClick={() => handlePresetChange(preset.name)}>
                        <div className="relative flex items-center p-2 sm:aspect-square sm:flex-col sm:justify-center sm:p-1.5">
                          <div className="bg-muted/5 absolute inset-2 rounded-md sm:inset-1.5" />

                          <div className="relative mr-3 flex h-full items-center justify-center sm:mr-0">
                            <div
                              className="relative h-12 w-12 rounded-full border border-white/20 shadow-lg sm:h-14 sm:w-14"
                              style={{
                                background: `radial-gradient(circle at 30% 30%, ${preset.color}40 0%, ${preset.color}80 25%, ${preset.color} 60%, ${preset.color.replace("#", "#").slice(0, 4)}${preset.color.slice(4)}CC 85%, ${preset.color.replace("#", "#").slice(0, 4)}${preset.color.slice(4)}AA 100%)`,
                                boxShadow: `
                                0 6px 20px ${preset.color}25,
                                inset 0 2px 0 rgba(255,255,255,0.3),
                                inset 0 -1px 0 rgba(0,0,0,0.15)
                              `,
                              }}>
                              <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/40 blur-[1px] sm:top-2.5 sm:left-2.5 sm:h-3.5 sm:w-3.5" />
                              <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-white/80 sm:top-3 sm:left-3 sm:h-2 sm:w-2" />
                              {/* Environment-specific effects */}
                              {preset.name === "sunset" && (
                                <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-orange-300/60 blur-[1px] sm:right-2.5 sm:bottom-2.5 sm:h-2.5 sm:w-2.5" />
                              )}
                              {preset.name === "studio" && (
                                <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-white/60 sm:top-3 sm:right-3 sm:h-2 sm:w-2" />
                              )}
                              {preset.name === "dawn" && (
                                <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-pink-300/50 blur-[1px] sm:right-2.5 sm:bottom-2.5 sm:h-2.5 sm:w-2.5" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 text-left sm:hidden">
                            <span className="text-muted-foreground text-sm font-medium">
                              {preset.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="hidden sm:block">
                      <p>{preset.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              <TooltipProvider key="custom-preset">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 sm:aspect-square sm:w-auto ${
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
                      }}>
                      <input
                        ref={hdriFileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                        onChange={handleHdriFileChange}
                      />
                      {customHdriUrl ? (
                        <div className="relative flex items-center p-2 sm:aspect-square sm:flex-col sm:justify-center sm:p-1.5">
                          <div className="bg-muted/20 absolute inset-2 rounded-md sm:inset-1.5" />

                          <div className="relative mr-3 flex h-full items-center justify-center sm:mr-0">
                            <div
                              className="h-12 w-12 rounded-full border border-white/20 bg-cover bg-center shadow-sm sm:h-14 sm:w-14"
                              style={{
                                backgroundImage: `url(${customHdriUrl})`,
                              }}
                            />
                          </div>

                          <div className="flex-1 text-left sm:hidden">
                            <span className="text-muted-foreground text-sm font-medium">
                              Custom
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex items-center p-2 sm:aspect-square sm:flex-col sm:justify-center sm:p-1.5">
                          <div className="bg-muted/5 absolute inset-2 rounded-md sm:inset-1.5" />

                          <div className="relative mr-3 flex h-full items-center justify-center sm:mr-0">
                            <div className="border-muted-foreground/30 bg-muted/20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed sm:h-14 sm:w-14">
                              <PlusIcon className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                          </div>

                          <div className="flex-1 text-left sm:hidden">
                            <span className="text-muted-foreground text-sm font-medium">
                              Custom
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="hidden sm:block">
                    <p>Custom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
