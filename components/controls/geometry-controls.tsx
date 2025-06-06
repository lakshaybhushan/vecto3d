import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BEVEL_PRESETS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { BevelPreview } from "@/components/previews/bevel-preview";

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
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {BEVEL_PRESETS.map((preset) => (
            <BevelPreview
              key={preset.name}
              preset={preset}
              isSelected={bevelPreset === preset.name}
              onClick={() => applyBevelPreset(preset.name)}
            />
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
