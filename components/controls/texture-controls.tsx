import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

export function TextureControls() {
  const {
    textureEnabled,
    setTextureEnabled,
    texturePreset,
    setTexturePreset,
    textureIntensity,
    setTextureIntensity,
    textureScale,
    setTextureScale,
    useEnvironment,
    setUseEnvironment,
  } = useEditorStore();

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
        case "stone":
          return {
            background: `radial-gradient(circle at 30% 30%, 
              #F5F5DC 0%, 
              #D3D3D3 50%, 
              #A9A9A9 100%)`,
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
      <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-sm">
            Texture settings will be applied to the exported 3D model during export.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Switch
          id="textureSwitch"
          checked={textureEnabled}
          onCheckedChange={handleTextureToggle}
        />
        <Label htmlFor="textureSwitch">Enable Textures</Label>
      </div>

      {textureEnabled && (
          <div className="space-y-6 pr-4">
            <div className="space-y-6">
              {Object.entries(texturesByCategory).map(
                ([category, textures]) => (
                  <div key={category} className="space-y-3">
                    <Label className="text-muted-foreground text-sm font-medium capitalize">
                      {category}
                    </Label>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                      {textures.map((texture) => (
                        <div
                          key={texture.name}
                          className={`flex cursor-pointer flex-col items-center rounded-lg pt-3 pb-2 ${
                            texturePreset === texture.name
                              ? "bg-primary/10 ring-input ring-1"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setTexturePreset(texture.name)}>
                          <div className="relative mb-2 aspect-video w-full overflow-hidden px-2">
                            {getTexturePreview(texture)}
                          </div>
                          <span className="text-center text-xs font-medium">
                            {texture.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="space-y-4">
                <Label
                  htmlFor="textureIntensity"
                  className="flex items-center justify-between">
                  <span>Texture Intensity</span>
                  <span className="text-primary font-mono">
                    {textureIntensity.toFixed(2)}
                  </span>
                </Label>
                <Slider
                  id="textureIntensity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[textureIntensity]}
                  onValueChange={(value) => setTextureIntensity(value[0])}
                />
              </div>

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
