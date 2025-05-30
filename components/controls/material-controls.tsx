import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MATERIAL_PRESETS, TEXTURE_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { PopoverPicker } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import type { MaterialPreset } from "@/lib/types";

export function MaterialControls() {
  const {
    materialPreset,
    setMaterialPreset,
    roughness,
    setRoughness,
    metalness,
    setMetalness,
    clearcoat,
    setClearcoat,
    transmission,
    setTransmission,
    envMapIntensity,
    setEnvMapIntensity,
    useCustomColor,
    setUseCustomColor,
    customColor,
    setCustomColor,
    // Texture properties
    textureEnabled,
    setTextureEnabled,
    texturePreset,
    setTexturePreset,
    textureIntensity,
    setTextureIntensity,
    textureScale,
    setTextureScale,
  } = useEditorStore();

  // Group textures by category
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

  const loadPreset = (preset: MaterialPreset) => {
    setMaterialPreset(preset.name);
    setRoughness(preset.roughness);
    setMetalness(preset.metalness);
    setClearcoat(preset.clearcoat);
    setTransmission(preset.transmission);
    setEnvMapIntensity(preset.envMapIntensity);
  };

  return (
    <div className="space-y-4">
      {/* Texture Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useTexture"
            checked={textureEnabled}
            onCheckedChange={(checked) => setTextureEnabled(checked as boolean)}
          />
          <Label htmlFor="useTexture">Use Textures</Label>
        </div>

        {textureEnabled && (
          <div className="space-y-4">
            <Label>Texture Presets</Label>
            {Object.entries(texturesByCategory).map(([category, textures]) => (
              <div key={category} className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium capitalize">
                  {category}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {textures.map((texture) => (
                    <Button
                      key={texture.name}
                      variant={
                        texturePreset === texture.name ? "default" : "outline"
                      }
                      size="sm"
                      className="h-auto gap-2 p-2"
                      onClick={() => setTexturePreset(texture.name)}>
                      {texture.previewImage ? (
                        <img
                          src={texture.previewImage}
                          alt={texture.label}
                          className="h-6 w-6 rounded object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-amber-200 to-amber-600" />
                      )}
                      <span className="text-xs">{texture.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <Label htmlFor="textureIntensity">
                Texture Intensity: {textureIntensity.toFixed(2)}
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

            <div className="space-y-4">
              <Label>Texture Scale</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="textureScaleX" className="text-xs">
                    X: {textureScale.x.toFixed(0)}x
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
                  <Label htmlFor="textureScaleY" className="text-xs">
                    Y: {textureScale.y.toFixed(0)}x
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTextureScale({ x: 25, y: 25 })}
                  className="flex-1">
                  25x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTextureScale({ x: 50, y: 50 })}
                  className="flex-1">
                  50x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTextureScale({ x: 75, y: 75 })}
                  className="flex-1">
                  75x
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <Label htmlFor="materialPreset">Material Type</Label>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {MATERIAL_PRESETS.map((preset) => {
          const reflectionColor =
            preset.metalness > 0
              ? `hsl(220, ${100 - preset.roughness * 60}%, ${
                  85 - preset.roughness * 40
                }%)`
              : `hsl(0, 0%, ${90 - preset.roughness * 60}%)`;

          const baseColor =
            preset.metalness > 0
              ? `hsl(220, ${70 - preset.roughness * 40}%, ${
                  60 - preset.roughness * 30
                }%)`
              : `hsl(220, 20%, ${70 - preset.roughness * 40}%)`;

          return (
            <button
              key={preset.name}
              className={`flex cursor-pointer flex-col items-center rounded-lg pt-3 pb-2 ${
                materialPreset === preset.name
                  ? "bg-primary/10 ring-input ring-1"
                  : "hover:bg-muted"
              }`}
              onClick={() => loadPreset(preset)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  loadPreset(preset);
                }
              }}
              type="button">
              <div className="relative mb-1 h-12 w-12 rounded-full">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, 
                      ${reflectionColor} 0%, 
                      ${baseColor} 50%, 
                      hsl(220, 15%, ${20 - preset.roughness * 10}%) 100%
                    )`,
                    opacity: preset.transmission > 0 ? 0.7 : 1,
                  }}
                />
                {preset.clearcoat > 0 && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg,
                        hsla(0, 0%, 100%, ${0.2 * preset.clearcoat}) 0%,
                        hsla(0, 0%, 100%, 0) 50%
                      )`,
                      mixBlendMode: "overlay",
                    }}
                  />
                )}

                {/* Glass/transmission effect */}
                {preset.transmission > 0 && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg,
                        hsla(190, 90%, 80%, ${0.3 * preset.transmission}) 0%,
                        hsla(190, 90%, 60%, ${0.1 * preset.transmission}) 100%
                      )`,
                      mixBlendMode: "screen",
                    }}
                  />
                )}
              </div>
              <span className="pt-1 text-xs font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {materialPreset === "custom" && (
        <div className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="roughness">Roughness: {roughness.toFixed(2)}</Label>
            <Slider
              id="roughness"
              min={0}
              max={1}
              step={0.01}
              value={[roughness]}
              onValueChange={(value) => setRoughness(value[0])}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="metalness">Metalness: {metalness.toFixed(2)}</Label>
            <Slider
              id="metalness"
              min={0}
              max={1}
              step={0.01}
              value={[metalness]}
              onValueChange={(value) => setMetalness(value[0])}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="clearcoat">Clearcoat: {clearcoat.toFixed(2)}</Label>
            <Slider
              id="clearcoat"
              min={0}
              max={1}
              step={0.01}
              value={[clearcoat]}
              onValueChange={(value) => setClearcoat(value[0])}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="transmission">
              Transmission: {transmission.toFixed(2)}
            </Label>
            <Slider
              id="transmission"
              min={0}
              max={1}
              step={0.01}
              value={[transmission]}
              onValueChange={(value) => setTransmission(value[0])}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="envMapIntensity">
              Environment Reflection: {envMapIntensity.toFixed(2)}
            </Label>
            <Slider
              id="envMapIntensity"
              min={0}
              max={3}
              step={0.1}
              value={[envMapIntensity]}
              onValueChange={(value) => setEnvMapIntensity(value[0])}
            />
          </div>
        </div>
      )}
      <div className="border-t">
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="useCustomColor"
            checked={useCustomColor}
            onCheckedChange={(checked) => setUseCustomColor(checked as boolean)}
          />
          <Label htmlFor="useCustomColor">Override material color</Label>
        </div>
      </div>

      {useCustomColor && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <PopoverPicker color={customColor} onChange={setCustomColor} />
            <Input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-22 font-mono uppercase"
            />
          </div>
        </div>
      )}
    </div>
  );
}
