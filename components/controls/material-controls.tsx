import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MATERIAL_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { PopoverPicker } from "@/components/ui/color-picker";

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
  } = useEditorStore();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
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
            <div
              key={preset.name}
              className={`flex cursor-pointer flex-col items-center rounded-lg pt-3 pb-2 ${
                materialPreset === preset.name
                  ? "bg-primary/10 ring-input ring-1"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                setMaterialPreset(preset.name);
                setRoughness(preset.roughness);
                setMetalness(preset.metalness);
                setClearcoat(preset.clearcoat);
                setTransmission(preset.transmission);
                setEnvMapIntensity(preset.envMapIntensity);
              }}>
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
            </div>
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
