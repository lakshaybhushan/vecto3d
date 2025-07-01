import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
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

  const [isTransparent, setIsTransparent] = useState(() => {
    // Only check transparency for 8-character hex colors (with alpha) or "transparent" keyword
    return (
      (backgroundColor.length === 9 && backgroundColor.endsWith("00")) ||
      backgroundColor === "transparent"
    );
  });
  const [lastOpaqueColor, setLastOpaqueColor] = useState(() =>
    isTransparent
      ? theme === "dark"
        ? DARK_MODE_COLOR
        : LIGHT_MODE_COLOR
      : backgroundColor,
  );

  useEffect(() => {
    const isTransparentNow =
      (backgroundColor.length === 9 && backgroundColor.endsWith("00")) ||
      backgroundColor === "transparent";
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
        !(
          (backgroundColor.length === 9 && backgroundColor.endsWith("00")) ||
          backgroundColor === "transparent"
        )
      ) {
        setLastOpaqueColor(backgroundColor);
      }
      setBackgroundColor("#00000000");
    } else {
      setBackgroundColor(lastOpaqueColor);
    }
  };

  const handleBackgroundChange = (color: string, preset: string) => {
    setUserSelectedBackground(true);
    setSolidColorPreset(preset);
    setBackgroundColor(color);
    const isColorTransparent =
      (color.length === 9 && color.endsWith("00")) || color === "transparent";
    setIsTransparent(isColorTransparent);
    if (!isColorTransparent) {
      setLastOpaqueColor(color);
    }
  };

  return (
    <div className="space-y-4">
      {/* <Alert className="bg-muted/50 mb-4">
        <AlertDescription className="flex items-center text-xs">
          <div className="mr-2 h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-muted-foreground mt-0.5 text-sm">
            Applies to <span className="text-primary">image exports</span>, not
            3D models.
          </p>
        </AlertDescription>
      </Alert> */}

      {/* <div className="border-primary/10 space-y-2 border-b pb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="transparency-toggle"
            checked={isTransparent}
            onCheckedChange={handleTransparencyToggle}
          />
          <Label htmlFor="transparency-toggle">Transparent Background</Label>
        </div>
      </div> */}

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="transparency-toggle" className="text-sm font-medium">
            Transparent Background
          </Label>
          <p className="text-muted-foreground text-xs">
            Make the background transparent.
          </p>
        </div>
        <Switch
          id="transparency-toggle"
          checked={isTransparent}
          onCheckedChange={handleTransparencyToggle}
        />
      </div>

      {!isTransparent && (
        <div className="space-y-4 pt-2">
          <Label>Background Color</Label>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SOLID_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  solidColorPreset === preset.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                onClick={() =>
                  handleBackgroundChange(preset.color, preset.name)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleBackgroundChange(preset.color, preset.name);
                  }
                }}
                type="button">
                <div className="relative aspect-[4/3] w-full p-2">
                  <div className="bg-muted/5 absolute inset-2 rounded-md" />

                  <div className="relative flex h-full items-center justify-center">
                    <div
                      className="h-14 w-14 rounded-full border border-white/20 shadow-lg"
                      style={{
                        background: preset.color,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 border-t px-2 py-2">
                  <span className="text-muted-foreground text-sm font-medium">
                    {preset.label}
                  </span>
                </div>
              </button>
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
              className="h-10 w-full">
              Reset to Theme Default
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
