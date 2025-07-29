import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            {SOLID_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className={`group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  solidColorPreset === preset.name
                    ? "bg-secondary"
                    : "hover:bg-secondary/50 hover:border-secondary"
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
                <div className="relative flex h-full flex-col">
                  <div className="bg-muted/5 absolute inset-0 rounded-md" />

                  <div className="relative flex flex-1 items-center justify-center">
                    <div
                      className="h-14 w-14 rounded-full border border-white/20 shadow-lg"
                      style={{
                        background: preset.color,
                      }}
                    />
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
