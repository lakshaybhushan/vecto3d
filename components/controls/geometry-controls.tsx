import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { GeometryControlsProps } from "@/lib/types";
import { BEVEL_PRESETS } from "@/lib/constants";

export function GeometryControls({
  depth,
  setDepth,
  bevelEnabled,
  setBevelEnabled,
  bevelThickness,
  setBevelThickness,
  bevelSize,
  setBevelSize,
  bevelSegments,
  setBevelSegments,
  bevelPreset,
  setBevelPreset,
  autoRotate,
  setAutoRotate,
  autoRotateSpeed,
  setAutoRotateSpeed,
}: GeometryControlsProps) {
  const displayToActualRotation = (displayValue: number) => {
    return displayValue + 1.5; // Convert 1-5 display scale to 2.5-7.5 actual scale
  };

  const actualToDisplayRotation = (actualValue: number) => {
    return actualValue - 1.5; // Convert 2.5-7.5 actual scale to 1-5 display scale
  };

  const applyBevelPreset = (presetName: string) => {
    const preset = BEVEL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setBevelPreset(preset.name);
      setBevelThickness(preset.thickness);
      setBevelSize(preset.size);
      setBevelSegments(preset.segments);
      setBevelEnabled(preset.name !== "none");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="depth">Thickness: {depth}</Label>
        <Slider
          id="depth"
          min={0.1}
          max={50}
          step={0.1}
          value={[depth]}
          onValueChange={(value) => setDepth(value[0])}
        />
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="bevelPreset">Bevel Style</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          {BEVEL_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className={`cursor-pointer rounded-lg p-2 flex flex-col items-center ${
                bevelPreset === preset.name
                  ? "bg-primary/20 ring-1 ring-primary"
                  : "hover:bg-muted"
              }`}
              onClick={() => applyBevelPreset(preset.name)}>
              <div
                className="w-14 h-14 mb-1 overflow-hidden relative"
                style={{
                  backgroundColor:
                    preset.name === "none"
                      ? "var(--background)"
                      : "var(--background)",
                  border: "1px solid hsl(var(--primary)/0.4)",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}>
                {preset.name === "none" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 bg-primary/10"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.4), hsl(var(--primary)/0.2))",
                        boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "light" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 bg-primary/10"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "6px",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.4), hsl(var(--primary)/0.2))",
                        boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "medium" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 bg-primary/20"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "12px",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.5), hsl(var(--primary)/0.2))",
                        boxShadow: "inset 3px -3px 6px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "heavy" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 bg-primary/30"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "20px",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.6), hsl(var(--primary)/0.3))",
                        boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "custom" && (
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div
                      className="w-10 h-10 bg-primary/40 relative"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "12px",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.6), hsl(var(--primary)/0.3))",
                        boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
                      }}></div>

                    <div
                      className="absolute w-3 h-3"
                      style={{
                        right: "8px",
                        top: "8px",
                      }}>
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(var(--primary)/0.95), hsl(var(--primary)/0.7))",
                          boxShadow:
                            "inset 1px 1px 3px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.1)",
                        }}>
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/40 rounded-full blur-[3px]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{preset.label}</span>
            </div>
          ))}
        </div>

        {bevelEnabled && bevelPreset === "custom" && (
          <>
            <div className="space-y-2 mt-4">
              <Label htmlFor="bevelThickness">
                Bevel Thickness: {bevelThickness.toFixed(1)}
              </Label>
              <Slider
                id="bevelThickness"
                min={0}
                max={3}
                step={0.1}
                value={[bevelThickness]}
                onValueChange={(value) => {
                  setBevelThickness(value[0]);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bevelSize">
                Bevel Size: {bevelSize.toFixed(1)}
              </Label>
              <Slider
                id="bevelSize"
                min={0}
                max={2}
                step={0.1}
                value={[bevelSize]}
                onValueChange={(value) => {
                  setBevelSize(value[0]);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bevelSegments">
                Bevel Quality: {bevelSegments}
              </Label>
              <Slider
                id="bevelSegments"
                min={1}
                max={10}
                step={1}
                value={[bevelSegments]}
                onValueChange={(value) => {
                  setBevelSegments(value[0]);
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 pt-2 mt-4 border-t">
        <div className="flex items-center space-x-2 mt-2 mb-1">
          <Checkbox
            id="autoRotate"
            checked={autoRotate}
            onCheckedChange={(checked) => setAutoRotate(checked as boolean)}
          />
          <Label htmlFor="autoRotate">Auto-rotate model</Label>
        </div>

        {autoRotate && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="autoRotateSpeed">
              Rotation Speed:{" "}
              {actualToDisplayRotation(autoRotateSpeed).toFixed(1)}
            </Label>
            <Slider
              id="autoRotateSpeed"
              min={1}
              max={10}
              step={0.5}
              value={[actualToDisplayRotation(autoRotateSpeed)]}
              onValueChange={(value) =>
                setAutoRotateSpeed(displayToActualRotation(value[0]))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
