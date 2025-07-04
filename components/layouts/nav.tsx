"use client";

import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import Link from "next/link";
import { AnimatedNumber } from "@/components/ui/animated-numbers";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  navigationVariants,
  staggeredContainerVariants,
  staggeredItemVariants,
} from "@/lib/motion-variants";

export default function Nav() {
  const [stars, setStars] = useState<number>(1050);

  useEffect(() => {
    fetch("https://api.github.com/repos/lakshaybhushan/vecto3d")
      .then((response) => response.json())
      .then((data) => {
        const starCount = data.stargazers_count;
        setStars(starCount);
      })
      .catch(() => setStars(0));
  }, []);

  return (
    <motion.header
      className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8"
      variants={navigationVariants}
      initial="initial"
      animate="animate"
      style={{ willChange: "transform" }}>
      <motion.div
        className="flex items-center space-x-2"
        variants={staggeredItemVariants}
        style={{ willChange: "transform" }}>
        <Logo className="text-primary h-7 w-7 sm:h-8 sm:w-8" />
      </motion.div>

      <motion.div
        className="flex items-center space-x-2 sm:space-x-3"
        variants={staggeredContainerVariants}
        initial="initial"
        animate="animate"
        style={{ willChange: "transform" }}>
        <motion.div
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          <ModeToggle />
        </motion.div>

        <motion.div
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          <Link
            href="https://github.com/lakshaybhushan/vecto3d"
            target="_blank"
            rel="noopener noreferrer">
            <Button className="flex h-7 w-fit items-center gap-1 rounded-sm text-xs sm:h-8 sm:text-sm">
              <Star size={14} />
              <AnimatedNumber
                value={stars}
                className="inline-flex items-center font-mono text-[11px] sm:text-[13px]"
                springOptions={{
                  bounce: 0,
                  duration: 2400,
                }}
              />
              <span className="mr-0.5 hidden sm:inline">Stars on GitHub</span>
              <GitHubIcon size={14} />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
