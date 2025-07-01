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
import GalaxyButton from "../ui/vibe-button";

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
      <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-sm">
            Applies to image exports only.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Switch
          id="useEnvironment"
          checked={useEnvironment}
          onCheckedChange={(checked) => setUseEnvironment(checked as boolean)}
        />
        <Label htmlFor="useEnvironment">Use Environment Lighting</Label>
      </div>

      {useEnvironment && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Presets</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {ENVIRONMENT_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    environmentPreset === preset.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  onClick={() => handlePresetChange(preset.name)}>
                  <div className="relative aspect-square w-full p-3">
                    <div
                      className="absolute inset-3 rounded-md"
                      style={{
                        backgroundColor: `${preset.color}15`,
                      }}
                    />
                    <div className="relative flex h-full items-center justify-center">
                      <div
                        className="relative h-10 w-10 rounded-full border border-white/20 shadow-lg"
                        style={{
                          backgroundColor: preset.color,
                          boxShadow: `
                          0 4px 12px ${preset.color}30,
                          inset 0 1px 0 rgba(255,255,255,0.2),
                          inset 0 -1px 0 rgba(0,0,0,0.1)
                        `,
                        }}>
                        <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/30 blur-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 border-t px-3 py-2 text-center">
                    <span className="text-muted-foreground text-sm font-medium">
                      {preset.label}
                    </span>
                  </div>
                </div>
              ))}

              <div
                key="custom-preset"
                className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  environmentPreset === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
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
                  <>
                    <div className="relative aspect-square w-full p-3">
                      <div
                        className="absolute inset-3 rounded-md bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${customHdriUrl})`,
                        }}
                      />
                    </div>
                    <div className="bg-muted/30 border-t px-3 py-2 text-center">
                      <span className="text-muted-foreground text-sm font-medium">
                        Custom
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative aspect-square w-full p-3">
                      <div className="border-muted-foreground/30 bg-muted/20 flex h-full items-center justify-center rounded-md border-2 border-dashed">
                        <PlusIcon className="text-muted-foreground h-6 w-6" />
                      </div>
                    </div>
                    <div className="bg-muted/30 border-t px-3 py-2 text-center">
                      <span className="text-muted-foreground text-sm font-medium">
                        Custom
                      </span>
                    </div>
                  </>
                )}
              </div>
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vibe Mode</Label>
              <div className="w-full cursor-not-allowed">
                {environmentPreset === "custom" && customHdriUrl ? (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={true}
                    className="w-full">
                    Sorry, Vibe Mode is not available with custom images :(
                  </Button>
                ) : (
                  <GalaxyButton
                    text={useBloom ? "Disable Vibe Mode" : "Enable Vibe Mode"}
                    className={`w-full py-5 text-base font-medium transition-all`}
                    gradientColors={["#FF6B6B", "#4ECDC4", "#45B29D"]}
                    textColor="#fff"
                    onClick={() => {
                      const newValue = !useBloom;
                      toggleVibeMode(newValue);
                    }}></GalaxyButton>
                )}
              </div>
            </div>

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
