import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BEVEL_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

const MIN_ACTUAL_DEPTH = 0.01;
const MAX_ACTUAL_DEPTH = 50;
const DEPTH_SLIDER_POWER = 2;
const SLIDER_DISPLAY_MIN = 0;
const SLIDER_DISPLAY_MAX = 100;
const SLIDER_DISPLAY_STEP = 1;

export function GeometryControls() {
  const depth = useEditorStore((state) => state.depth);
  const setDepth = useEditorStore((state) => state.setDepth);
  const bevelEnabled = useEditorStore((state) => state.bevelEnabled);
  const setBevelEnabled = useEditorStore((state) => state.setBevelEnabled);
  const bevelThickness = useEditorStore((state) => state.bevelThickness);
  const setBevelThickness = useEditorStore((state) => state.setBevelThickness);
  const bevelSize = useEditorStore((state) => state.bevelSize);
  const setBevelSize = useEditorStore((state) => state.setBevelSize);
  const bevelSegments = useEditorStore((state) => state.bevelSegments);
  const setBevelSegments = useEditorStore((state) => state.setBevelSegments);
  const bevelPreset = useEditorStore((state) => state.bevelPreset);
  const setBevelPreset = useEditorStore((state) => state.setBevelPreset);
  const autoRotate = useEditorStore((state) => state.autoRotate);
  const setAutoRotate = useEditorStore((state) => state.setAutoRotate);
  const autoRotateSpeed = useEditorStore((state) => state.autoRotateSpeed);
  const setAutoRotateSpeed = useEditorStore(
    (state) => state.setAutoRotateSpeed,
  );

  const displayToActualDepth = (displayValue: number): number => {
    const normalizedValue = Math.max(
      0,
      Math.min(1, displayValue / SLIDER_DISPLAY_MAX),
    );
    const actual =
      MIN_ACTUAL_DEPTH +
      (MAX_ACTUAL_DEPTH - MIN_ACTUAL_DEPTH) *
        Math.pow(normalizedValue, DEPTH_SLIDER_POWER);
    return Math.max(MIN_ACTUAL_DEPTH, Math.min(MAX_ACTUAL_DEPTH, actual));
  };

  const actualToDisplayDepth = (actualValue: number): number => {
    const clampedActual = Math.max(
      MIN_ACTUAL_DEPTH,
      Math.min(MAX_ACTUAL_DEPTH, actualValue),
    );
    if (MAX_ACTUAL_DEPTH - MIN_ACTUAL_DEPTH === 0) {
      return SLIDER_DISPLAY_MIN;
    }
    const normalizedValue =
      (clampedActual - MIN_ACTUAL_DEPTH) /
      (MAX_ACTUAL_DEPTH - MIN_ACTUAL_DEPTH);
    const display =
      SLIDER_DISPLAY_MAX * Math.pow(normalizedValue, 1 / DEPTH_SLIDER_POWER);
    return Math.max(SLIDER_DISPLAY_MIN, Math.min(SLIDER_DISPLAY_MAX, display));
  };

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
        <Label htmlFor="depth" className="flex items-center justify-between">
          <span>Adjust Thickness</span>
          <span className="text-primary font-mono">{depth.toFixed(2)}</span>
        </Label>
        <Slider
          id="depth"
          min={SLIDER_DISPLAY_MIN}
          max={SLIDER_DISPLAY_MAX}
          step={SLIDER_DISPLAY_STEP}
          value={[actualToDisplayDepth(depth)]}
          onValueChange={(value) => setDepth(displayToActualDepth(value[0]))}
        />
      </div>

      <div className="space-y-4 pt-2">
        <Label htmlFor="bevelPreset">Bevel Style</Label>
        <div className="mb-4 space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-5 md:space-y-0">
          {BEVEL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 sm:aspect-square sm:w-auto ${
                bevelPreset === preset.name
                  ? "bg-secondary"
                  : "hover:bg-secondary/50 hover:border-secondary"
              }`}
              onClick={() => applyBevelPreset(preset.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  applyBevelPreset(preset.name);
                }
              }}
              type="button">
              <div className="relative flex h-full flex-col">
                <div className="bg-muted/5 absolute inset-0 rounded-md" />

                <div className="relative flex flex-1 items-center justify-center">
                  <div
                    className="relative h-12 w-12 overflow-hidden rounded-md sm:h-14 sm:w-14"
                    style={{
                      backgroundColor: "var(--input)",
                      border: "1px solid hsl(var(--primary)/0.4)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="bg-primary/40 from-primary/40 to-primary/20 relative h-9 w-9 bg-gradient-to-tl sm:h-10 sm:w-10"
                        style={{
                          position: "absolute",
                          bottom: "-1px",
                          left: "-1px",
                          borderTopRightRadius:
                            preset.previewStyle?.borderRadius || "0px",
                          boxShadow:
                            preset.previewStyle?.boxShadow ||
                            "inset 2px -2px 4px rgba(255,255,255,0.4)",
                        }}
                      />
                      {preset.name === "custom" && (
                        <div
                          className="absolute"
                          style={{
                            right: "7px",
                            top: "8px",
                          }}>
                          <div className="bg-primary/40 from-primary/40 to-primary/20 dark:bg-primary/40 dark:from-primary/40 dark:to-primary/20 flex h-3 w-3 items-center justify-center rounded-full">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="dark:text-primary text-secondary">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 px-2 py-1.5 text-center">
                  <p className="text-foreground text-xs leading-tight font-medium">
                    {preset.label}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {bevelEnabled && bevelPreset === "custom" && (
          <div className="space-y-4 py-2">
            <div className="space-y-4">
              <Label
                htmlFor="bevelThickness"
                className="flex items-center justify-between">
                <span>Bevel Thickness</span>
                <span className="text-primary font-mono">
                  {bevelThickness.toFixed(2)}
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
              <Label
                htmlFor="bevelSize"
                className="flex items-center justify-between">
                <span>Bevel Size</span>
                <span className="text-primary font-mono">
                  {bevelSize.toFixed(2)}
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
              <Label
                htmlFor="bevelSegments"
                className="flex items-center justify-between">
                <span>Bevel Quality</span>
                <span className="text-primary font-mono">
                  {bevelSegments.toFixed(2)}
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
          <Label htmlFor="autoRotate" className="text-sm">
            Auto rotate model
          </Label>
        </div>

        {autoRotate && (
          <div className="mt-4 space-y-4 py-2">
            <Label
              htmlFor="autoRotateSpeed"
              className="flex items-center justify-between">
              <span>Rotation Speed</span>
              <span className="text-primary font-mono">
                {actualToDisplayRotation(autoRotateSpeed).toFixed(2)}
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
