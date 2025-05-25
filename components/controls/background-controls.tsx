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
    // userSelectedBackground,
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
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-xs">
            Background settings are for preview only and will not affect the
            exported 3D model.
          </p>
        </AlertDescription>
      </Alert>
      <div className="space-y-4">
        <Label>Background Color</Label>

        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SOLID_COLOR_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className={`flex cursor-pointer flex-col items-center rounded-lg pt-3 pb-2 ${
                solidColorPreset === preset.name
                  ? "bg-primary/10 ring-input ring-1"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleBackgroundChange(preset.color, preset.name)}>
              <div
                className="border-input mb-1 h-12 w-12 rounded-full border"
                style={{
                  background: preset.color,
                }}
              />
              <span className="pt-1 text-xs font-medium">{preset.label}</span>
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

        <div className="border-primary/10 space-y-2 border-t pt-4">
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
            className="h-11 w-full">
            Reset to Theme Default
          </Button>
        </div>
      </div>
    </div>
  );
}
