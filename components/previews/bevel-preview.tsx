import { memo } from "react";
import type { BevelPreset } from "@/lib/types";

interface BevelPreviewProps {
  preset: BevelPreset;
  isSelected: boolean;
  onClick: () => void;
}

export const BevelPreview = memo(function BevelPreview({
  preset,
  isSelected,
  onClick,
}: BevelPreviewProps) {
  return (
    <div
      className={`flex cursor-pointer flex-col items-center rounded-lg pt-4 pb-2 ${
        isSelected ? "bg-primary/10 ring-input ring-1" : "hover:bg-muted"
      }`}
      onClick={onClick}>
      <div
        className="relative mb-1 h-14 w-14 overflow-hidden"
        style={{
          backgroundColor: "var(--input)",
          border: "1px solid hsl(var(--primary)/0.4)",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-primary/40 from-primary/40 to-primary/20 relative h-10 w-10 bg-gradient-to-tl"
            style={{
              position: "absolute",
              bottom: "-2px",
              left: "-2px",
              borderTopRightRadius: preset.previewStyle?.borderRadius || "0px",
              boxShadow:
                preset.previewStyle?.boxShadow ||
                "inset 2px -2px 4px rgba(255,255,255,0.4)",
            }}
          />
          {preset.name === "custom" && (
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
                }}
              />
            </div>
          )}
        </div>
      </div>
      <span className="pt-1 text-xs font-medium">{preset.label}</span>
    </div>
  );
});
