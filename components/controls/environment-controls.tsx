import { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";
import { toast } from "sonner";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { motion } from "framer-motion";
import { BsStars } from "react-icons/bs";
import { useEditorStore } from "@/lib/store";

export function EnvironmentControls() {
  const {
    useEnvironment,
    setUseEnvironment,
    environmentPreset,
    setEnvironmentPreset,
    customHdriUrl,
    setCustomHdriUrl,
    useBloom,
    // setUseBloom,
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
        <AlertDescription className="text-xs flex items-center">
          <InfoIcon className="h-4 w-4 mr-2" />
          Environment settings are for preview only and will not affect the
          exported 3D model.
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="useEnvironment"
          checked={useEnvironment}
          onCheckedChange={(checked) => setUseEnvironment(checked as boolean)}
        />
        <Label htmlFor="useEnvironment">Use Environment Lighting</Label>
      </div>

      {useEnvironment && (
        <>
          <div className="space-y-2">
            <Label htmlFor="environmentPreset">Environment Preset</Label>
            <Select
              value={environmentPreset}
              onValueChange={setEnvironmentPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENT_PRESETS.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.label}
                  </SelectItem>
                ))}
                {customHdriUrl && (
                  <SelectItem value="custom">Custom Image</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 my-3">
            {ENVIRONMENT_PRESETS.map((preset) => (
              <div
                key={preset.name}
                className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${
                  environmentPreset === preset.name
                    ? "bg-primary/20 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => setEnvironmentPreset(preset.name)}>
                <div
                  className="w-12 h-12 rounded-full mb-1 overflow-hidden"
                  style={{
                    background: preset.color,
                    boxShadow: "0 0 8px rgba(0,0,0,0.15) inset",
                  }}
                />
                <span className="text-xs font-medium text-center">
                  {preset.label.split(" ")[0]}
                </span>
              </div>
            ))}

            <div
              className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${
                environmentPreset === "custom"
                  ? "bg-primary/20 ring-1 ring-primary"
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
                  <div
                    className="w-12 h-12 rounded-full mb-1 overflow-hidden"
                    style={{
                      backgroundImage: `url(${customHdriUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="text-xs font-medium">Custom</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full mb-1 flex items-center justify-center bg-primary/10">
                    <span className="text-2xl font-semibold text-primary">
                      +
                    </span>
                  </div>
                  <span className="text-xs font-medium">Custom</span>
                </>
              )}
            </div>
          </div>

          {environmentPreset === "custom" && customHdriUrl && (
            <div className="mt-3 p-3 bg-muted/30 rounded-md">
              <div className="flex items-start">
                <InfoIcon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Your image will be used for reflections in the 3D model
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs h-7"
                    onClick={() => hdriFileInputRef.current?.click()}>
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {useEnvironment && (
        <div className="space-y-4 pt-4 mt-4 border-t">
          <div className="w-full">
            {environmentPreset === "custom" && customHdriUrl ? (
              <Button
                variant="outline"
                size="lg"
                disabled={true}
                className="w-full opacity-50 cursor-not-allowed">
                Vibe Mode Not Available with Custom Images
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
                {useBloom ? "Disable Vibe Mode" : "Enable Vibe Mode"}
                <BsStars className="w-4 h-4 ml-2" />
              </RainbowButton>
            )}
          </div>

          {useBloom && (
            <motion.div
              className="space-y-4 mt-2 p-4 bg-muted/20 rounded-md border border-primary/20"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.15 }}>
              <div className="space-y-2">
                <Label
                  htmlFor="bloomIntensity"
                  className="flex justify-between">
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
                <Checkbox
                  id="bloomMipmapBlur"
                  checked={bloomMipmapBlur}
                  onCheckedChange={(checked) =>
                    setBloomMipmapBlur(checked as boolean)
                  }
                />
                <Label htmlFor="bloomMipmapBlur">
                  Smooth Bloom (Better Quality)
                </Label>
              </div>
              <div className="space-y-2 pt-3 border-t border-primary/10">
                <Label htmlFor="modelRotation" className="flex justify-between">
                  <span>Model Rotation</span>
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
