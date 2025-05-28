"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { MobileWarning } from "@/components/mobile-warning";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Footer from "@/components/footer";
import Nav from "@/components/nav";
import AnimatedLogo from "@/components/ui/animated-logo";
import BackgroundEffect from "@/components/ui/background-effect";
import {
  pageVariants,
  loadingOverlayVariants,
  loadingLogoVariants,
  titleSpanVariants,
  fileUploadVariants,
  helpTextVariants,
  continueButtonVariants,
  staggeredContainerVariants,
  staggeredItemVariants,
} from "@/lib/motion-variants";

export default function Home() {
  const router = useRouter();
  const [svgData, setSvgData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isMobile, continueOnMobile, handleContinueOnMobile } =
    useMobileDetection();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileUpload = (data: string, name: string) => {
    setSvgData(data);
    setFileName(name);

    setTimeout(() => {
      const element = document.getElementById("continue-button-section");
      if (element) {
        window.scrollTo({
          top: element.offsetTop - window.innerHeight / 4,
          behavior: "smooth",
        });
      }
    }, 200);
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);

    setTimeout(() => {
      const element = document.getElementById("continue-button-section");
      if (element) {
        window.scrollTo({
          top: element.offsetTop - window.innerHeight / 4,
          behavior: "smooth",
        });
      }
    }, 200);
  };

  const handleContinue = async () => {
    if (svgData) {
      setIsLoading(true);

      try {
        localStorage.setItem("svgData", svgData);
        localStorage.setItem("fileName", fileName);
        localStorage.setItem("selectedIcon", selectedIcon);

        if (isMobile) {
          localStorage.setItem("continueOnMobile", "true");
        }

        const animationSpeed = 2;
        const baseDuration = 2.7;
        const animationCycleDuration = baseDuration / animationSpeed;
        const delayMs = Math.ceil(animationCycleDuration * 1000) + 300;
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        router.push("/edit");
      } catch (error) {
        console.error("Error during navigation:", error);
        setIsLoading(false);
      }
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <motion.main
      className="relative flex min-h-screen w-full flex-col"
      initial="initial"
      animate="animate"
      variants={staggeredContainerVariants}
      style={{ willChange: "transform" }}>
      <BackgroundEffect />

      <motion.div
        variants={staggeredItemVariants}
        style={{ willChange: "transform" }}>
        <Nav />
      </motion.div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg"
            variants={loadingOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit">
            <motion.div
              className="flex flex-col items-center gap-4"
              variants={loadingLogoVariants}
              initial="initial"
              animate="animate"
              exit="exit">
              <AnimatedLogo
                size={128}
                className="text-primary"
                isLoading={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-1 flex-col items-center justify-center px-6 md:px-12"
        variants={pageVariants.content}
        style={{ willChange: "transform" }}>
        <motion.div
          className="mb-8 text-center"
          variants={staggeredItemVariants}
          style={{ willChange: "transform" }}>
          <motion.h1
            className="leading-tighter text-primary font-serif text-4xl tracking-tight md:text-5xl lg:text-7xl"
            variants={pageVariants.title}
            style={{ willChange: "transform" }}>
            <motion.span
              variants={titleSpanVariants.first}
              initial="initial"
              animate="animate"
              style={{ willChange: "transform" }}>
              Transform Your Vectors{" "}
            </motion.span>
            <br className="hidden sm:block" />
            <motion.span
              className="text-primary"
              variants={titleSpanVariants.second}
              initial="initial"
              animate="animate"
              style={{ willChange: "transform" }}>
              in a New Dimension
            </motion.span>
          </motion.h1>
        </motion.div>

        {isMobile && !continueOnMobile ? (
          <motion.div
            className="w-full"
            variants={staggeredItemVariants}
            style={{ willChange: "transform" }}>
            <MobileWarning onContinue={handleContinueOnMobile} />
          </motion.div>
        ) : (
          <motion.div
            className="mx-auto w-fit"
            variants={staggeredItemVariants}
            style={{ willChange: "transform" }}>
            <motion.div
              className="w-full"
              variants={fileUploadVariants}
              initial="initial"
              animate="animate"
              style={{ willChange: "transform" }}>
              <FileUpload
                onFileUpload={handleFileUpload}
                fileName={fileName}
                selectedIcon={selectedIcon}
                onIconSelect={handleIconSelect}
              />
              <motion.p
                className="text-muted-foreground mt-4 mb-4 text-center text-base"
                variants={helpTextVariants}
                initial="initial"
                animate="animate"
                style={{ willChange: "transform" }}>
                Works best with SVGs having simple geometry and transparent
                background
              </motion.p>
            </motion.div>

            <motion.div
              id="continue-button-section"
              className="flex items-center justify-center">
              <AnimatePresence mode="wait">
                {svgData && (
                  <motion.div
                    className="flex w-full justify-center"
                    variants={continueButtonVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ willChange: "transform" }}>
                    <div className="flex w-full max-w-lg">
                      <RainbowButton
                        className="text-md mx-auto w-full py-6 md:w-1/2"
                        onClick={handleContinue}
                        disabled={isLoading}>
                        <span className="flex items-center gap-2">
                          {isLoading ? "Processing..." : "Continue to Editor"}
                        </span>
                      </RainbowButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={staggeredItemVariants}
        style={{ willChange: "transform" }}>
        <Footer />
      </motion.div>
    </motion.main>
  );
}
