"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Box, Palette, Image, Mountain, Monitor } from "lucide-react";

type AnimatedTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export const AnimatedTabs = memo(
  ({ activeTab, onTabChange }: AnimatedTabsProps) => {
    const navRef = useRef<HTMLDivElement | null>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({
      width: 0,
      left: 0,
      opacity: 0,
    });
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const tabs = [
      { id: "geometry", name: "Geometry", icon: Box },
      { id: "material", name: "Material", icon: Palette },
      { id: "textures", name: "Textures", icon: Image },
      { id: "environment", name: "Environment", icon: Mountain },
      { id: "background", name: "Background", icon: Monitor },
    ];

    useEffect(() => {
      const updateIndicator = () => {
        const activeTabElement = tabRefs.current[activeTab];
        const navElement = navRef.current;
        if (activeTabElement && navElement) {
          const tabRect = activeTabElement.getBoundingClientRect();
          const navRect = navElement.getBoundingClientRect();
          setIndicatorStyle({
            left: tabRect.left - navRect.left,
            width: tabRect.width,
            opacity: 1,
          });
        }
      };

      const rafId = requestAnimationFrame(updateIndicator);

      const resizeObserver = new ResizeObserver(() => updateIndicator());
      if (navRef.current) resizeObserver.observe(navRef.current);
      if (tabRefs.current[activeTab])
        resizeObserver.observe(tabRefs.current[activeTab]!);

      window.addEventListener("resize", updateIndicator);

      return () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        window.removeEventListener("resize", updateIndicator);
      };
    }, [activeTab]);

    return (
      <div className="scrollbar-hidden overflow-x-auto border-b">
        <nav ref={navRef} className="relative flex w-full items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                onClick={() => onTabChange(tab.id)}
                className={`flex min-w-[120px] flex-1 cursor-pointer items-center justify-center px-3 py-3 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}

          <motion.div
            className="bg-primary absolute bottom-0 h-0.5"
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        </nav>
      </div>
    );
  },
);

AnimatedTabs.displayName = "AnimatedTabs";
