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
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

export function BackgroundControls() {
  const backgroundColor = useEditorStore((state) => state.backgroundColor);
  const setBackgroundColor = useEditorStore(
    (state) => state.setBackgroundColor,
  );
  const setUserSelectedBackground = useEditorStore(
    (state) => state.setUserSelectedBackground,
  );
  const solidColorPreset = useEditorStore((state) => state.solidColorPreset);
  const setSolidColorPreset = useEditorStore(
    (state) => state.setSolidColorPreset,
  );

  const { theme } = useTheme();

  const [isTransparent, setIsTransparent] = useState(
    () => backgroundColor.endsWith("00") || backgroundColor === "transparent",
  );
  const [lastOpaqueColor, setLastOpaqueColor] = useState(() =>
    isTransparent
      ? theme === "dark"
        ? DARK_MODE_COLOR
        : LIGHT_MODE_COLOR
      : backgroundColor,
  );

  useEffect(() => {
    const isTransparentNow =
      backgroundColor.endsWith("00") || backgroundColor === "transparent";
    setIsTransparent(isTransparentNow);
    if (!isTransparentNow) {
      setLastOpaqueColor(backgroundColor);
    }
  }, [backgroundColor]);

  const handleTransparencyToggle = (checked: boolean) => {
    setIsTransparent(checked);
    setUserSelectedBackground(true);
    setSolidColorPreset("custom");

    if (checked) {
      if (
        !(backgroundColor.endsWith("00") || backgroundColor === "transparent")
      ) {
        setLastOpaqueColor(backgroundColor);
      }
      setBackgroundColor("#00000000"); // Standard transparent color
    } else {
      setBackgroundColor(lastOpaqueColor);
    }
  };

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
          <p className="text-muted-foreground mt-0.5 text-sm">
            Works with <span className="text-primary">image exports</span> . If
            you export a 3D model, the background color will be ignored.
          </p>
        </AlertDescription>
      </Alert>

      <div className="border-primary/10 space-y-2 border-b pb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="transparency-toggle"
            checked={isTransparent}
            onCheckedChange={handleTransparencyToggle}
          />
          <Label htmlFor="transparency-toggle">Transparent Background</Label>
        </div>
      </div>

      {!isTransparent && (
        <div className="space-y-4 pt-2">
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
                onClick={() =>
                  handleBackgroundChange(preset.color, preset.name)
                }>
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
                onChange={(e) =>
                  handleBackgroundChange(e.target.value, "custom")
                }
                className="w-26 font-mono uppercase"
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
              className="h-10 w-full">
              Reset to Theme Default
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
