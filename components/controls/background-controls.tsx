import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import {
  SOLID_COLOR_PRESETS,
  DARK_MODE_COLOR,
  LIGHT_MODE_COLOR,
} from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import { useTheme } from "next-themes";

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
          <InfoIcon className="h-4 w-4 mr-2" />
          Background settings are for preview only and will not be included in
          the exported 3D model.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Label>Background Color</Label>
        <div className="flex items-center mb-2 text-sm text-muted-foreground">
          <span>
            Currently using:{" "}
            {userSelectedBackground ? "Custom selection" : "Theme default"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SOLID_COLOR_PRESETS.map((preset) => (
            <div
              key={preset.name}
              className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${
                solidColorPreset === preset.name
                  ? "bg-primary/20 ring-1 ring-primary"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleBackgroundChange(preset.color, preset.name)}>
              <div
                className="w-12 h-12 rounded-full mb-1"
                style={{
                  background: preset.color,
                }}
              />
              <span className="text-xs font-medium">{preset.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="backgroundColor">Custom Color</Label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="backgroundColor"
              value={backgroundColor}
              onChange={(e) => handleBackgroundChange(e.target.value, "custom")}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleBackgroundChange(e.target.value, "custom")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="pt-2">
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
            className="w-full">
            Reset to Theme Default
          </Button>
        </div>
      </div>
    </div>
  );
}
