"use client";

import Link from "next/link";
import { VercelIcon, V0Icon } from "@/components/ui/example-icons";
import { motion } from "framer-motion";
import {
  footerVariants,
  staggeredContainerVariants,
  staggeredItemVariants,
} from "@/lib/motion-variants";

export default function Footer() {
  return (
    <motion.footer
      className="w-full px-8 py-4"
      variants={footerVariants}
      initial="initial"
      animate="animate"
      style={{ willChange: "transform" }}>
      <motion.div
        className="text-muted-foreground flex flex-col items-center justify-between text-sm md:flex-row"
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
          className="mt-2 flex items-center gap-1 md:mt-0"
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          Ideated with{" "}
          <Link
            href="https://v0.dev/chat/three-js-logo-converter-JEQ692TQD4t"
            className="text-primary flex items-center gap-2 font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            <span className="sm:inline">
              <V0Icon size={20} />
            </span>
          </Link>
          —
          <Link
            href="https://lakshb.dev"
            className="hover:text-primary font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            lakshaybhushan
          </Link>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
