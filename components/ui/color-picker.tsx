import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

interface PopoverPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const PopoverPicker = ({ color, onChange }: PopoverPickerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openPopover = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      let newY = triggerRect.bottom + 12;
      if (newY + popoverRect.height > window.innerHeight) {
        newY = triggerRect.top - popoverRect.height - 12;
      }

      let newX = triggerRect.left;
      if (newX + popoverRect.width > window.innerWidth) {
        newX = window.innerWidth - popoverRect.width - 12;
      }

      if (newY < 12) newY = 12;
      if (newX < 12) newX = 12;

      setPosition({ x: newX, y: newY });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current?.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      closePopover();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, closePopover]);

  return (
    <>
      <div ref={triggerRef} onClick={openPopover} className="inline-block">
        <div
          className="border-input h-9 w-16 cursor-pointer rounded-sm border"
          style={{ backgroundColor: color }}
        />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[9999] rounded-lg shadow-lg"
            style={{ top: position.y, left: position.x }}>
            <HexColorPicker color={color} onChange={onChange} />
          </div>,
          document.body,
        )}
    </>
  );
};
