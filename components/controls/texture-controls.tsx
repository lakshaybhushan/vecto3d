import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

export function TextureControls() {
  const textureEnabled = useEditorStore((state) => state.textureEnabled);
  const setTextureEnabled = useEditorStore((state) => state.setTextureEnabled);
  const texturePreset = useEditorStore((state) => state.texturePreset);
  const setTexturePreset = useEditorStore((state) => state.setTexturePreset);
  const textureScale = useEditorStore((state) => state.textureScale);
  const setTextureScale = useEditorStore((state) => state.setTextureScale);
  const useEnvironment = useEditorStore((state) => state.useEnvironment);
  const setUseEnvironment = useEditorStore((state) => state.setUseEnvironment);

  const handleTextureToggle = (enabled: boolean) => {
    setTextureEnabled(enabled);

    if (enabled && useEnvironment) {
      setUseEnvironment(false);
      toast.info("Environment lighting disabled to prevent texture conflicts", {
        duration: 2500,
      });
    }
  };

  const getTexturePreview = (texture: (typeof TEXTURE_PRESETS)[0]) => {
    if (texture.previewImage) {
      return (
        <Image
          src={texture.previewImage}
          alt={texture.label}
          width={100}
          height={100}
          className="h-full w-full rounded-b-none object-cover"
        />
      );
    }

    const getPatternStyle = () => {
      switch (texture.category) {
        case "wood":
          return {
            background: `linear-gradient(90deg, 
              ${texture.name.includes("oak") ? "#D2B48C" : "#8B4513"} 0%, 
              ${texture.name.includes("oak") ? "#CD853F" : "#A0522D"} 50%, 
              ${texture.name.includes("oak") ? "#DEB887" : "#8B4513"} 100%)`,
          };
        case "miscellaneous":
          return {
            background: `linear-gradient(45deg, 
              ${texture.name.includes("denim") ? "#4169E1" : texture.name.includes("leather") ? "#8B4513" : "#F0F8FF"} 0%, 
              ${texture.name.includes("denim") ? "#191970" : texture.name.includes("leather") ? "#A0522D" : "#E6E6FA"} 100%)`,
          };
        default:
          return {
            background: "linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%)",
          };
      }
    };

    return (
      <div className="h-full w-full rounded-md" style={getPatternStyle()} />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="textureSwitch" className="text-sm font-medium">
            Enable Textures
          </Label>
          <p className="text-muted-foreground text-xs">
            Enable textures for the 3D model.
          </p>
        </div>
        <Switch
          id="textureSwitch"
          checked={textureEnabled}
          onCheckedChange={handleTextureToggle}
        />
      </div>

      {textureEnabled && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {TEXTURE_PRESETS.map((texture) => (
              <button
                key={texture.name}
                className={`group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  texturePreset === texture.name
                    ? "bg-secondary"
                    : "hover:bg-secondary/50 hover:border-secondary"
                }`}
                onClick={() => setTexturePreset(texture.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setTexturePreset(texture.name);
                  }
                }}
                type="button">
                <div className="relative flex h-full flex-col">
                  <div className="bg-muted/5 absolute inset-0" />

                  <div className="relative flex flex-1 items-center justify-center">
                    <div
                      className="relative h-full w-full overflow-hidden rounded-b-none"
                      style={{
                        backgroundColor: "var(--input)",
                        border: "1px solid hsl(var(--primary)/0.4)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getTexturePreview(texture)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 px-2 py-1.5 text-center">
                    <p className="text-foreground text-xs leading-tight font-medium">
                      {texture.label}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-4 pt-2">
              <Label>Texture Scale</Label>
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="textureScaleX"
                    className="flex justify-between text-xs">
                    <span>X Scale</span>
                    <span className="text-primary font-mono">
                      {textureScale.x.toFixed(0)}x
                    </span>
                  </Label>
                  <Slider
                    id="textureScaleX"
                    min={10}
                    max={200}
                    step={10}
                    value={[textureScale.x]}
                    onValueChange={(value) =>
                      setTextureScale({ ...textureScale, x: value[0] })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="textureScaleY"
                    className="flex justify-between text-xs">
                    <span>Y Scale</span>
                    <span className="text-primary font-mono">
                      {textureScale.y.toFixed(0)}x
                    </span>
                  </Label>
                  <Slider
                    id="textureScaleY"
                    min={10}
                    max={200}
                    step={10}
                    value={[textureScale.y]}
                    onValueChange={(value) =>
                      setTextureScale({ ...textureScale, y: value[0] })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
