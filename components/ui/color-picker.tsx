"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface PopoverPickerProps {
  color: string;
  label?: string;
  onChange: (color: string) => void;
}

export function PopoverPicker({
  color,
  label = "Color",
  onChange,
}: PopoverPickerProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          data-cuelume-press="press"
          data-cuelume-release="release"
          aria-label={`Choose ${label.toLowerCase()}`}
          title={color}
          className="size-6 shrink-0 cursor-pointer rounded-[5px] border border-white/15 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.16)] transition-[border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.95]"
          style={{ backgroundColor: color }}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="left"
          align="center"
          sideOffset={8}
          collisionPadding={8}
          aria-label={`${label} picker`}
          className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 w-[208px] origin-[var(--radix-popover-content-transform-origin)] rounded-md border border-white/[0.08] bg-[#181818] p-2.5 text-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.4)] duration-150 outline-none">
          <HexColorPicker
            color={color}
            onChange={onChange}
            className="simple-color-picker"
          />
          <HexColorInput
            color={color}
            onChange={onChange}
            prefixed
            aria-label={`${label} hex value`}
            className="mt-2.5 h-8 w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 text-[14px] text-[#c8c8c8] transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-[#666] focus:border-white/20 focus:ring-2 focus:ring-white/10"
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
