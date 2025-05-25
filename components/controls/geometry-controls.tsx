import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BEVEL_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

export function GeometryControls() {
  const {
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
  } = useEditorStore();

  const displayToActualRotation = (displayValue: number) => {
    return displayValue + 1.5;
  };

  const actualToDisplayRotation = (actualValue: number) => {
    return actualValue - 1.5;
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
      <div className="space-y-4">
        <Label htmlFor="depth">
          <span>Adjust Thickness</span>
          <span className="text-primary font-mono">{depth.toFixed(1)}</span>
        </Label>
        <Slider
          id="depth"
          min={0.1}
          max={50}
          step={0.1}
          value={[depth]}
          onValueChange={(value) => setDepth(value[0])}
        />
      </div>

      <div className="space-y-4 pt-2">
        <Label htmlFor="bevelPreset">Bevel Style</Label>
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {BEVEL_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className={`flex cursor-pointer flex-col items-center rounded-lg pt-4 pb-2 ${
                bevelPreset === preset.name
                  ? "bg-primary/10 ring-input ring-1"
                  : "hover:bg-muted"
              }`}
              onClick={() => applyBevelPreset(preset.name)}>
              <div
                className="relative mb-1 h-14 w-14 overflow-hidden"
                style={{
                  backgroundColor:
                    preset.name === "none" ? "var(--input)" : "var(--input)",
                  border: "1px solid hsl(var(--primary)/0.4)",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}>
                {preset.name === "none" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "light" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "6px",
                        boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "medium" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "12px",
                        boxShadow: "inset 3px -3px 6px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "heavy" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "20px",
                        boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
                      }}
                    />
                  </div>
                )}

                {preset.name === "custom" && (
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div
                      className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "-2px",
                        borderTopRightRadius: "12px",
                        boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
                      }}></div>

                    <div
                      className="absolute h-3 w-3"
                      style={{
                        right: "8px",
                        top: "8px",
                      }}>
                      <div
                        className="bg-primary/40 from-primary/40 to-primary/20 relative h-full w-full rounded-full bg-gradient-to-tl"
                        style={{
                          boxShadow:
                            "inset 1px 1px 3px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.1)",
                        }}>
                        <div className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-white/40 blur-[3px]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="pt-1 text-xs font-medium">{preset.label}</span>
            </div>
          ))}
        </div>

        {bevelEnabled && bevelPreset === "custom" && (
          <div className="space-y-4 pb-2">
            <div className="space-y-4">
              <Label htmlFor="bevelThickness">
                <span>Bevel Thickness</span>
                <span className="text-primary font-mono">
                  {bevelThickness.toFixed(1)}
                </span>
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

            <div className="space-y-4">
              <Label htmlFor="bevelSize">
                <span>Bevel Size</span>
                <span className="text-primary font-mono">
                  {bevelSize.toFixed(1)}
                </span>
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

            <div className="space-y-4">
              <Label htmlFor="bevelSegments">
                <span>Bevel Quality</span>
                <span className="text-primary font-mono">
                  {bevelSegments.toFixed(1)}
                </span>
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
          </div>
        )}
      </div>

      <div className="border-t">
        <div className="flex items-center space-x-2 pt-4">
          <Switch
            id="autoRotate"
            checked={autoRotate}
            onCheckedChange={(checked) => setAutoRotate(checked as boolean)}
          />
          <Label htmlFor="autoRotate">Auto rotate model</Label>
        </div>

        {autoRotate && (
          <div className="mt-4 space-y-4 py-2">
            <Label htmlFor="autoRotateSpeed">
              <span>Rotation Speed</span>
              <span className="text-primary font-mono">
                {actualToDisplayRotation(autoRotateSpeed).toFixed(1)}
              </span>
            </Label>
            <Slider
              id="autoRotateSpeed"
              min={1}
              max={20}
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
