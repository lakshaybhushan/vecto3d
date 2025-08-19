"use client";

import { memo } from "react";
import { Box, Palette, Image, Mountain, Monitor } from "lucide-react";

type MobileTabBarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export const MobileTabBar = memo(
  ({ activeTab, onTabChange }: MobileTabBarProps) => {
    const tabs = [
      { id: "geometry", label: "Geometry", icon: Box },
      { id: "material", label: "Material", icon: Palette },
      { id: "textures", label: "Textures", icon: Image },
      { id: "environment", label: "Environment", icon: Mountain },
      { id: "background", label: "Background", icon: Monitor },
    ];

    return (
      <div className="bg-background/98 border-border/50 flex-shrink-0 border-t backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}>
                <Icon className={isActive ? "h-6 w-6" : "h-5 w-5"} />
                <span
                  className={`text-[9px] leading-none font-medium ${isActive ? "text-primary" : "text-muted-foreground/60"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

MobileTabBar.displayName = "MobileTabBar";
