import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SOLID_COLOR_PRESETS,
  DARK_MODE_COLOR,
  LIGHT_MODE_COLOR,
} from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { PopoverPicker } from "../ui/color-picker";

export function BackgroundControls() {
  const {
    backgroundColor,
    setBackgroundColor,
    userSelectedBackground,
    setUserSelectedBackground,
    solidColorPreset,
    setSolidColorPreset,
  } = useEditorStore();

  const { theme } = useTheme();

  const handleBackgroundChange = (color: string, preset: string) => {
    setUserSelectedBackground(true);
    setSolidColorPreset(preset);
    setBackgroundColor(color);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="text-xs flex items-center">
          <div className="h-5 w-1 bg-blue-500 rounded-full mr-2" />
          <p className="text-xs text-muted-foreground">
            Background settings are for preview only and will not affect the
            exported 3D model.
          </p>
        </AlertDescription>
      </Alert>
      <div className="space-y-4">
        <Label>Background Color</Label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          {SOLID_COLOR_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className={`cursor-pointer rounded-lg pt-3 pb-2 flex flex-col items-center ${
                solidColorPreset === preset.name
                  ? "bg-primary/10 ring-1 ring-input"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleBackgroundChange(preset.color, preset.name)}>
              <div
                className="w-12 h-12 rounded-full mb-1 border border-input"
                style={{
                  background: preset.color,
                }}
              />
              <span className="text-xs font-medium pt-1">{preset.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <Label htmlFor="backgroundColor">Custom color</Label>
          <div className="flex items-center space-x-2">
            <PopoverPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleBackgroundChange(e.target.value, "custom")}
              className="w-22 font-mono uppercase"
            />
          </div>
        </div>

        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUserSelectedBackground(false);
              if (theme === "dark") {
                setBackgroundColor(DARK_MODE_COLOR);
                setSolidColorPreset("dark");
              } else {
                setBackgroundColor(LIGHT_MODE_COLOR);
                setSolidColorPreset("light");
              }
            }}
            className="w-full h-11">
            Reset to Theme Default
          </Button>
        </div>
      </div>
    </div>
  );
}
