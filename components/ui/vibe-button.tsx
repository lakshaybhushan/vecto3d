import React, { useRef, useCallback } from "react";

interface VibeButtonProps {
  text: string;
  gradientColors?: string[];
  textColor?: string;
  fontSize?: string;
  padding?: string;
  className?: string;
  onClick?: () => void;
  onVibeToggle?: (isActive: boolean) => void;
}

const VibeButton = ({
  text,
  gradientColors = ["#f87171", "#60a5fa", "#c084fc"],
  textColor = "white",
  fontSize = "1rem",
  padding = "0.875rem 2.5rem",
  className = "",
  onClick,
  onVibeToggle,
}: VibeButtonProps) => {
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingActionRef = useRef(false);

  const handleMouseDown = useCallback(() => {
    isHoldingActionRef.current = true;
    holdTimeoutRef.current = setTimeout(() => {
      if (isHoldingActionRef.current) {
        onVibeToggle?.(true);
        isHoldingActionRef.current = false;
      }
    }, 1500);
  }, [onVibeToggle]);

  const handleMouseUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHoldingActionRef.current) {
      onClick?.();
    }
    isHoldingActionRef.current = false;
  }, [onClick]);

  const handleMouseLeave = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    isHoldingActionRef.current = false;
  }, []);

  const gradientStyle = `linear-gradient(to right, ${gradientColors.join(", ")})`;

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`group relative z-0 overflow-hidden rounded-xl focus:outline-none ${className}`}
      style={{
        background: "rgba(17, 24, 39, 0.8)",
        padding,
        fontSize,
        color: textColor,
      } as React.CSSProperties}>
      
    
      <div className="absolute inset-0 rounded-xl border border-white/10" />

      {isHoldingActionRef.current && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full">
          <div
            className="h-full transition-all duration-[1500ms] ease-linear"
            style={{ 
              background: gradientStyle,
              width: "100%"
            }}
          />
        </div>
      )}

      <span className="relative z-10 font-light">{text}</span>
    </button>
  );
};

export default VibeButton;
