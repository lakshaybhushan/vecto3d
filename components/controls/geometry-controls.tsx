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
          min={0.5}
          max={100}
          step={0.5}
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
                className="w-14 h-14 rounded-md mb-1 flex items-center justify-center overflow-hidden"
                style={
                  preset.name === "none"
                    ? {
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                      }
                    : preset.name === "custom"
                    ? {
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.8), hsl(var(--primary)/0.6))",
                        border: "1px solid hsl(var(--primary)/0.3)",
                        boxShadow: "inset 0 0 8px rgba(255,255,255,0.3)",
                        borderRadius: "10%",
                      }
                    : {
                        position: "relative",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)/0.5), hsl(var(--primary)/0.3))",
                        border: "1px solid hsl(var(--primary)/0.3)",
                        borderRadius: `${preset.size * 15}%`,
                        boxShadow: `
                            inset 0 0 0 ${
                              preset.thickness
                            }px rgba(255,255,255,0.2),
                            0 ${preset.thickness * 2}px ${
                          preset.thickness * 3
                        }px rgba(0,0,0,0.15)
                          `,
                      }
                }>
                {preset.name === "none" && (
                  <div className="w-6 h-6 rounded-sm bg-muted-foreground/20"></div>
                )}
                {preset.name === "light" && (
                  <div className="w-6 h-6 rounded-[2px] bg-primary/40"></div>
                )}
                {preset.name === "medium" && (
                  <div className="w-6 h-6 rounded-[4px] bg-primary/40"></div>
                )}
                {preset.name === "heavy" && (
                  <div className="w-6 h-6 rounded-[8px] bg-primary/40"></div>
                )}
                {preset.name === "custom" && (
                  <div className="text-primary-foreground text-xs font-semibold relative z-10">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 17C3 17.5523 3.44772 18 4 18H10C10.5523 18 11 17.5523 11 17V13H3V17Z"
                        fill="currentColor"
                      />
                      <path
                        d="M11 13V9C11 8.44772 10.5523 8 10 8H4C3.44772 8 3 8.44772 3 9V13H11Z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 9C12 8.44772 12.4477 8 13 8H19C19.5523 8 20 8.44772 20 9V17C20 17.5523 19.5523 18 19 18H13C12.4477 18 12 17.5523 12 17V9Z"
                        fill="currentColor"
                      />
                    </svg>
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
