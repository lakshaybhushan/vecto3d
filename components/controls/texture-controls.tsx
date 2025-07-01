import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    }
  };

  const texturesByCategory = TEXTURE_PRESETS.reduce(
    (acc, texture) => {
      if (!acc[texture.category]) {
        acc[texture.category] = [];
      }
      acc[texture.category].push(texture);
      return acc;
    },
    {} as Record<string, typeof TEXTURE_PRESETS>,
  );

  const getTexturePreview = (texture: (typeof TEXTURE_PRESETS)[0]) => {
    if (texture.previewImage) {
      return (
        <Image
          src={texture.previewImage}
          alt={texture.label}
          width={100}
          height={100}
          className="h-full w-full rounded-md object-cover"
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
      {/* <div className="flex items-center justify-between space-x-2">
        <Switch
          id="textureSwitch"
          checked={textureEnabled}
          onCheckedChange={handleTextureToggle}
        />
        <Label htmlFor="textureSwitch" className="text-sm font-medium">
          Enable Textures
        </Label>
      </div> */}

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
          <div className="space-y-6">
            {Object.entries(texturesByCategory).map(([category, textures]) => (
              <div key={category} className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {textures.map((texture) => (
                    <div
                      key={texture.name}
                      className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        texturePreset === texture.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                      onClick={() => setTexturePreset(texture.name)}>
                      <div className="relative aspect-square w-full p-3">
                        {/* Clean background */}
                        <div className="bg-muted/20 absolute inset-3 rounded-md" />

                        {/* Texture preview container */}
                        <div className="relative flex h-full items-center justify-center">
                          <div className="h-full w-full overflow-hidden rounded-md">
                            {getTexturePreview(texture)}
                          </div>
                        </div>
                      </div>

                      {/* Clean label at bottom */}
                      <div className="bg-muted/30 border-t px-3 py-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          {texture.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-4 pt-2">
              <Label>Texture Scale</Label>
              <div className="grid grid-cols-2 gap-4">
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
                    min={5}
                    max={100}
                    step={1}
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
                    min={5}
                    max={100}
                    step={1}
                    value={[textureScale.y]}
                    onValueChange={(value) =>
                      setTextureScale({ ...textureScale, y: value[0] })
                    }
                  />
                </div>
              </div>

              <div className="border-primary/10 border-t pt-3">
                <Label className="text-muted-foreground mb-2 block text-xs">
                  Quick Scale Presets
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTextureScale({ x: 25, y: 25 })}
                    className="h-8 text-xs">
                    25x
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTextureScale({ x: 50, y: 50 })}
                    className="h-8 text-xs">
                    50x
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTextureScale({ x: 75, y: 75 })}
                    className="h-8 text-xs">
                    75x
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
