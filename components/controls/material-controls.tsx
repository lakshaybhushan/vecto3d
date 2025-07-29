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
          background: `radial-gradient(circle at 30% 30%, #B8BCC8 0%, #9CA3AF 25%, #6B7280 60%, #374151 85%, #1F2937 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)`,
        };
      case "brushed-metal":
        return {
          background: `radial-gradient(circle at 30% 30%, #F1F5F9 0%, #E2E8F0 20%, #CBD5E1 45%, #94A3B8 70%, #64748B 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.2), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)`,
        };
      case "polished-metal":
        return {
          background: `radial-gradient(circle at 25% 25%, #FFFFFF 0%, #F8FAFC 10%, #E2E8F0 30%, #CBD5E1 55%, #94A3B8 75%, #64748B 100%)`,
          boxShadow: `0 8px 25px rgba(0,0,0,0.15), inset 0 4px 0 rgba(255,255,255,0.7), inset 0 -2px 0 rgba(0,0,0,0.1)`,
        };
      case "glossy-plastic":
        return {
          background: `radial-gradient(circle at 25% 25%, #FFFFFF 0%, #F9FAFB 15%, #F3F4F6 35%, #E5E7EB 60%, #D1D5DB 100%)`,
          boxShadow: `0 8px 25px rgba(0,0,0,0.12), inset 0 4px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.08)`,
        };
      case "matte-plastic":
        return {
          background: `radial-gradient(circle at 40% 30%, #F9FAFB 0%, #F3F4F6 30%, #E5E7EB 65%, #D1D5DB 100%)`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)`,
        };
      case "clear-glass":
        return {
          background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.8) 20%, rgba(241,245,249,0.6) 50%, rgba(226,232,240,0.4) 80%, rgba(148,163,184,0.2) 100%)`,
          boxShadow: `0 8px 25px rgba(0,0,0,0.12), inset 0 3px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)`,
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(0.5px)",
        };
      case "frosted-glass":
        return {
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.75) 30%, rgba(241,245,249,0.6) 60%, rgba(226,232,240,0.45) 100%)`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.8)`,
          border: "1px solid rgba(255,255,255,0.4)",
          backdropFilter: "blur(1px)",
        };
      default:
        return {
          background: `radial-gradient(circle at 30% 30%, #818CF8 0%, #6366F1 35%, #4F46E5 70%, #3730A3 100%)`,
          boxShadow: `0 6px 20px rgba(79,70,229,0.25), inset 0 2px 0 rgba(255,255,255,0.3)`,
        };
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Select your material of choice</p>

      <div className="mb-4 space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-5 md:space-y-0">
        {MATERIAL_PRESETS.map((preset) => {
          const materialStyle = getMaterialStyle(preset);

          return (
            <button
              key={preset.name}
              className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 sm:aspect-square sm:w-auto ${
                materialPreset === preset.name
                  ? "bg-secondary"
                  : "hover:bg-secondary/50 hover:border-secondary"
              }`}
              onClick={() => loadPreset(preset)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  loadPreset(preset);
                }
              }}
              type="button">
              <div className="relative flex h-full flex-col">
                <div className="bg-muted/5 absolute inset-0 rounded-md" />

                <div className="relative flex flex-1 items-center justify-center">
                  <div
                    className="h-12 w-12 rounded-full sm:h-14 sm:w-14"
                    style={materialStyle}>
                    {preset.name === "brushed-metal" && (
                      <div
                        className="absolute inset-0 rounded-full opacity-60"
                        style={{
                          background: `repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.2) 1px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 3px)`,
                          mixBlendMode: "overlay",
                        }}
                      />
                    )}

                    {preset.name === "polished-metal" && (
                      <>
                        <div className="absolute top-2 left-2 h-4 w-4 rounded-full bg-white/90 blur-[2px] sm:top-2.5 sm:left-2.5 sm:h-5 sm:w-5" />
                        <div className="absolute top-2.5 left-2.5 h-2 w-2 rounded-full bg-white sm:top-3 sm:left-3 sm:h-2.5 sm:w-2.5" />
                      </>
                    )}

                    {(preset.name === "clear-glass" ||
                      preset.name === "frosted-glass") && (
                      <>
                        <div className="absolute top-2 left-2 h-5 w-5 rounded-full bg-white/80 blur-[3px] sm:top-2.5 sm:left-2.5 sm:h-6 sm:w-6" />
                        <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-white sm:top-3.5 sm:left-3.5 sm:h-2.5 sm:w-2.5" />
                        <div className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-black/15 sm:right-3.5 sm:bottom-3.5 sm:h-2 sm:w-2" />
                      </>
                    )}

                    {preset.name === "glossy-plastic" && (
                      <>
                        <div className="absolute top-2 left-2 h-4 w-4 rounded-full bg-white/80 blur-[1px] sm:top-2.5 sm:left-2.5 sm:h-5 sm:w-5" />
                        <div className="absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-full bg-white/95 sm:top-3 sm:left-3 sm:h-3.5 sm:w-3.5" />
                      </>
                    )}

                    {preset.name === "matte-plastic" && (
                      <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-white/50 blur-[1px] sm:top-3.5 sm:left-3.5 sm:h-3 sm:w-3" />
                    )}

                    {preset.name === "matte-metal" && (
                      <div className="absolute top-3 left-3 h-3 w-3 rounded-full bg-white/40 blur-[1px] sm:top-3.5 sm:left-3.5 sm:h-3.5 sm:w-3.5" />
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 px-2 py-1.5 text-center">
                  <p className="text-foreground text-xs leading-tight font-medium">
                    {preset.label}
                  </p>
                </div>
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
