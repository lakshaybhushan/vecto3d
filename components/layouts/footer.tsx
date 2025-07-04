"use client";

import Link from "next/link";
import { VercelIcon } from "@/components/ui/icons";
import { motion } from "framer-motion";
import {
  footerVariants,
  staggeredContainerVariants,
  staggeredItemVariants,
} from "@/lib/motion-variants";

export default function Footer() {
  return (
    <motion.footer
      className="w-full px-4 py-3 sm:px-6 sm:py-4 lg:px-8"
      variants={footerVariants}
      initial="initial"
      animate="animate"
      style={{ willChange: "transform" }}>
      <motion.div
        className="text-muted-foreground flex flex-col items-center justify-between text-xs sm:text-sm md:flex-row"
        variants={staggeredContainerVariants}
        initial="initial"
        animate="animate"
        style={{ willChange: "transform" }}>
        <motion.div
          className="flex items-center gap-1"
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          Hosted on{" "}
          <Link
            href="https://vercel.com"
            className="text-primary flex items-center gap-0.5 font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            <span className="-mt-0.5">
              <VercelIcon size={12} />
            </span>
            <span className="hidden sm:inline">Vercel</span>
          </Link>
        </motion.div>

        <motion.div
          className="mt-1.5 flex items-center gap-1 sm:mt-2 md:mt-0"
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          Made for vibes by{" "}
          <Link
            href="https://lakshb.dev"
            className="text-primary font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            lakshaybhushan
          </Link>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
