import { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusIcon } from "lucide-react";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";
import { toast } from "sonner";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { motion } from "framer-motion";
import { useEditorStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { VibeModeIcon } from "@/components/ui/ui-icons";

export function EnvironmentControls() {
  const {
    useEnvironment,
    setUseEnvironment,
    environmentPreset,
    setEnvironmentPreset,
    customHdriUrl,
    setCustomHdriUrl,
    useBloom,
    bloomIntensity,
    setBloomIntensity,
    bloomMipmapBlur,
    setBloomMipmapBlur,
    modelRotationY,
    setModelRotationY,
    toggleVibeMode,
  } = useEditorStore();

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

    if (!isJpg && !isPng) {
      toast.error("Unsupported file format: Only JPG and PNG are supported");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large: Image must be smaller than 10MB");
      return;
    }

    const reader = new FileReader();

    try {
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomHdriUrl(event.target.result as string);
          setEnvironmentPreset("custom");
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Failed to process image");
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast.error("Failed to read the image file");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      toast.error("Failed to read the image file");
    }

    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-xs">
            Environment settings are for preview only and will not affect the
            exported 3D model.
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
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {ENVIRONMENT_PRESETS.map((preset) => (
              <div
                key={preset.name}
                className={`flex cursor-pointer flex-col items-center rounded-lg p-2 ${
                  environmentPreset === preset.name
                    ? "bg-primary/10 ring-input ring-1"
                    : "hover:bg-muted"
                }`}
                onClick={() => setEnvironmentPreset(preset.name)}>
                <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md">
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${preset.color}40, ${preset.color}, ${preset.color}90)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, white, ${preset.color}80, rgba(0,0,0,0.2))`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    />
                  </div>
                </div>
                <span className="text-center text-xs font-medium">
                  {preset.label}
                </span>
              </div>
            ))}

            <div
              key="custom-preset"
              className={`flex cursor-pointer flex-col items-center rounded-md p-2 ${
                environmentPreset === "custom"
                  ? "bg-primary/10 ring-input ring-1"
                  : "hover:bg-muted"
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
                  <div className="mb-2 aspect-video w-full overflow-hidden rounded-md">
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundImage: `url(${customHdriUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">Custom</span>
                </>
              ) : (
                <>
                  <div className="bg-primary/5 border-primary/20 mb-2 flex aspect-video w-full items-center justify-center rounded-md border-2 border-dashed">
                    <span className="text-primary text-2xl font-semibold">
                      <PlusIcon className="text-primary h-4 w-4" />
                    </span>
                  </div>
                  <span className="text-xs font-medium">Custom</span>
                </>
              )}
            </div>
          </div>

          {environmentPreset === "custom" && customHdriUrl && (
            <Alert className="bg-muted/50 mb-4">
              <AlertDescription className="flex items-center text-xs">
                <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
                <div className="flex w-full items-center justify-between">
                  <p className="text-muted-foreground text-xs">
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
        </>
      )}

      {useEnvironment && (
        <div className="mt-4 space-y-4 border-t pt-4">
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
              <RainbowButton
                className={`w-full py-5 text-base font-semibold transition-all ${
                  useBloom ? "animate-rainbow" : "opacity-90 hover:opacity-100"
                }`}
                onClick={() => {
                  const newValue = !useBloom;
                  toggleVibeMode(newValue);
                }}>
                <VibeModeIcon />
                <span className="ml-1">
                  {useBloom ? "Disable Vibe Mode" : "Enable Vibe Mode"}
                </span>
              </RainbowButton>
            )}
          </div>

          {useBloom && (
            <motion.div
              className="bg-muted/20 border-primary/20 mt-2 space-y-4 rounded-md border p-4"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.15 }}>
              <div className="space-y-4">
                <Label htmlFor="bloomIntensity">
                  <span>Bloom Intensity</span>
                  <span className="text-primary font-mono">
                    {bloomIntensity.toFixed(1)}
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
                <Label htmlFor="modelRotation" className="flex justify-between">
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
      )}
    </div>
  );
}
