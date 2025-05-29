"use client";

import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { GitHubIcon } from "@/components/ui/example-icons";
import Link from "next/link";
import { AnimatedNumber } from "./ui/animated-numbers";
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
      className="flex w-full items-center justify-between px-8 py-4"
      variants={navigationVariants}
      initial="initial"
      animate="animate"
      style={{ willChange: "transform" }}>
      <motion.div
        className="flex items-center space-x-2"
        variants={staggeredItemVariants}
        style={{ willChange: "transform" }}>
        <Logo className="text-primary h-8 w-8" />
      </motion.div>

      <motion.div
        className="flex items-center space-x-3"
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
            <Button className="flex h-8 w-fit items-center gap-1 rounded-sm">
              <Star size={16} />
              <AnimatedNumber
                value={stars}
                className="inline-flex items-center font-mono text-[13px]"
                springOptions={{
                  bounce: 0,
                  duration: 2400,
                }}
              />
              <span className="mr-0.5 hidden sm:inline">Stars on GitHub</span>
              <GitHubIcon size={16} />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
