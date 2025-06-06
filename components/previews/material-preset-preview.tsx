import { memo } from "react";
import type { MaterialPreset } from "@/lib/types";

interface MaterialPresetPreviewProps {
  preset: MaterialPreset;
  isSelected: boolean;
  onClick: () => void;
}

export const MaterialPresetPreview = memo(function MaterialPresetPreview({
  preset,
  isSelected,
  onClick,
}: MaterialPresetPreviewProps) {
  const reflectionColor =
    preset.metalness > 0
      ? `hsl(220, ${100 - preset.roughness * 60}%, ${
          85 - preset.roughness * 40
        }%)`
      : `hsl(0, 0%, ${90 - preset.roughness * 60}%)`;

  const baseColor =
    preset.metalness > 0
      ? `hsl(220, ${70 - preset.roughness * 40}%, ${
          60 - preset.roughness * 30
        }%)`
      : `hsl(220, 20%, ${70 - preset.roughness * 40}%)`;

  return (
    <button
      className={`flex cursor-pointer flex-col items-center rounded-lg pt-3 pb-2 ${
        isSelected ? "bg-primary/10 ring-input ring-1" : "hover:bg-muted"
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      type="button">
      <div className="relative mb-1 h-12 w-12 rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, 
              ${reflectionColor} 0%, 
              ${baseColor} 50%, 
              hsl(220, 15%, ${20 - preset.roughness * 10}%) 100%
            )`,
            opacity: preset.transmission > 0 ? 0.7 : 1,
          }}
        />
        {preset.clearcoat > 0 && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg,
                hsla(0, 0%, 100%, ${0.2 * preset.clearcoat}) 0%,
                hsla(0, 0%, 100%, 0) 50%
              )`,
              mixBlendMode: "overlay",
            }}
          />
        )}

        {preset.transmission > 0 && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg,
                hsla(190, 90%, 80%, ${0.3 * preset.transmission}) 0%,
                hsla(190, 90%, 60%, ${0.1 * preset.transmission}) 100%
              )`,
              mixBlendMode: "screen",
            }}
          />
        )}
      </div>
      <span className="pt-1 text-xs font-medium">{preset.label}</span>
    </button>
  );
});
