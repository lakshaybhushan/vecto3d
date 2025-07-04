import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MATERIAL_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { PopoverPicker } from "@/components/ui/color-picker";
import type { MaterialPreset } from "@/lib/types";

export function MaterialControls() {
  const materialPreset = useEditorStore((state) => state.materialPreset);
  const setMaterialPreset = useEditorStore((state) => state.setMaterialPreset);
  const roughness = useEditorStore((state) => state.roughness);
  const setRoughness = useEditorStore((state) => state.setRoughness);
  const metalness = useEditorStore((state) => state.metalness);
  const setMetalness = useEditorStore((state) => state.setMetalness);
  const clearcoat = useEditorStore((state) => state.clearcoat);
  const setClearcoat = useEditorStore((state) => state.setClearcoat);
  const transmission = useEditorStore((state) => state.transmission);
  const setTransmission = useEditorStore((state) => state.setTransmission);
  const envMapIntensity = useEditorStore((state) => state.envMapIntensity);
  const setEnvMapIntensity = useEditorStore(
    (state) => state.setEnvMapIntensity,
  );
  const useCustomColor = useEditorStore((state) => state.useCustomColor);
  const setUseCustomColor = useEditorStore((state) => state.setUseCustomColor);
  const customColor = useEditorStore((state) => state.customColor);
  const setCustomColor = useEditorStore((state) => state.setCustomColor);

  const loadPreset = (preset: MaterialPreset) => {
    setMaterialPreset(preset.name);
    setRoughness(preset.roughness);
    setMetalness(preset.metalness);
    setClearcoat(preset.clearcoat);
    setTransmission(preset.transmission);
    setEnvMapIntensity(preset.envMapIntensity);
  };

  const getMaterialStyle = (preset: MaterialPreset) => {
    switch (preset.name) {
      case "matte-metal":
        return {
          background: `radial-gradient(circle at 30% 30%, #9CA3AF 0%, #6B7280 40%, #374151 80%, #1F2937 100%)`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.2)`,
        };
      case "brushed-metal":
        return {
          background: `
            radial-gradient(circle at 30% 30%, #D1D5DB 0%, #9CA3AF 40%, #6B7280 100%),
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, transparent 50%, rgba(255,255,255,0.1) 75%, transparent 100%)
          `,
          backgroundSize: "100% 100%, 6px 100%",
          boxShadow: `0 4px 12px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)`,
        };
      case "polished-metal":
        return {
          background: `radial-gradient(circle at 25% 25%, #F9FAFB 0%, #E5E7EB 15%, #D1D5DB 40%, #9CA3AF 70%, #6B7280 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.15), inset 0 3px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.1)`,
        };
      case "glossy-plastic":
        return {
          background: `radial-gradient(circle at 25% 25%, #FFFFFF 0%, #F3F4F6 20%, #E5E7EB 50%, #D1D5DB 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.1), inset 0 3px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)`,
        };
      case "matte-plastic":
        return {
          background: `radial-gradient(circle at 40% 40%, #F3F4F6 0%, #E5E7EB 50%, #D1D5DB 100%)`,
          boxShadow: `0 3px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)`,
        };
      case "clear-glass":
        return {
          background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.3) 70%, rgba(0,0,0,0.1) 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)`,
          border: "1px solid rgba(255,255,255,0.2)",
        };
      case "frosted-glass":
        return {
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.7)`,
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(1px)",
        };
      default:
        return {
          background: `radial-gradient(circle at 30% 30%, #6366F1 0%, #4F46E5 50%, #3730A3 100%)`,
          boxShadow: `0 4px 12px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
        };
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Select your material of choice</p>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {MATERIAL_PRESETS.map((preset) => {
          const materialStyle = getMaterialStyle(preset);

          return (
            <button
              key={preset.name}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                materialPreset === preset.name
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onClick={() => loadPreset(preset)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  loadPreset(preset);
                }
              }}
              type="button">
              <div className="relative aspect-[4/3] w-full p-2">
                <div className="bg-muted/5 absolute inset-2 rounded-md" />

                <div className="relative flex h-full items-center justify-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" style={materialStyle}>
                    {preset.name === "brushed-metal" && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)`,
                          mixBlendMode: "overlay",
                        }}
                      />
                    )}

                    {preset.name === "polished-metal" && (
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-white/70 blur-sm" />
                    )}

                    {(preset.name === "clear-glass" ||
                      preset.name === "frosted-glass") && (
                      <>
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/80" />
                        <div className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-black/15" />
                      </>
                    )}

                    {preset.name === "glossy-plastic" && (
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/90" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border-t px-2 py-1.5 sm:py-2">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                  {preset.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {materialPreset === "custom" && (
        <div className="space-y-4 py-2">
          <div className="space-y-4">
            <Label
              htmlFor="roughness"
              className="flex items-center justify-between">
              <span>Roughness</span>
              <span className="text-primary font-mono">
                {roughness.toFixed(2)}
              </span>
            </Label>
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
            <Label
              htmlFor="metalness"
              className="flex items-center justify-between">
              <span>Metalness</span>
              <span className="text-primary font-mono">
                {metalness.toFixed(2)}
              </span>
            </Label>
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
            <Label
              htmlFor="clearcoat"
              className="flex items-center justify-between">
              <span>Clearcoat</span>
              <span className="text-primary font-mono">
                {clearcoat.toFixed(2)}
              </span>
            </Label>
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
            <Label
              htmlFor="transmission"
              className="flex items-center justify-between">
              <span>Transmission</span>
              <span className="text-primary font-mono">
                {transmission.toFixed(2)}
              </span>
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
            <Label
              htmlFor="envMapIntensity"
              className="flex items-center justify-between">
              <span>Environment Reflection</span>
              <span className="text-primary font-mono">
                {envMapIntensity.toFixed(2)}
              </span>
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
