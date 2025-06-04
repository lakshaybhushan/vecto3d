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
  loadingOverlayVariants,
  loadingLogoVariants,
  titleSpanVariants,
  fileUploadVariants,
  helpTextVariants,
  continueButtonVariants,
  continueButtonContainerVariants,
  staggeredContainerVariants,
  staggeredItemVariants,
  pageTransitionVariants,
  titleContainerVariants,
} from "@/lib/motion-variants";
import { useEditorStore } from "@/lib/store";

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

  useEffect(() => {
    if (isLoading) {
      try {
        const audio = new Audio("/continue.mp3");
        audio.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      } catch (error) {
        console.log("Audio initialization failed:", error);
      }
    }
  }, [isLoading]);

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
    }, 150);
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
    }, 150);
  };

  const handleContinue = async () => {
    if (svgData) {
      setIsLoading(true);

      try {
        const { setSvgData, setFileName } = useEditorStore.getState();
        setSvgData(svgData);
        setFileName(fileName);

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
      className="relative flex h-screen w-full flex-col overflow-hidden"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: "transform" }}>
      <BackgroundEffect />

      <motion.div
        className="flex-shrink-0"
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
        className="flex flex-1 flex-col items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-12"
        variants={staggeredContainerVariants}
        initial="initial"
        animate="animate"
        style={{ willChange: "transform", minHeight: 0 }}>
        <motion.div
          className="mb-2 text-center sm:mb-3 md:mb-6"
          variants={titleContainerVariants}
          initial="initial"
          animate="animate"
          style={{ willChange: "transform" }}>
          <h1 className="text-primary leading-tighter font-serif text-5xl tracking-tight md:text-6xl">
            <motion.span
              variants={titleSpanVariants}
              style={{
                display: "inline-block",
                willChange: "transform",
              }}>
              Transform Your Vectors{" "}
            </motion.span>
            <br className="hidden sm:block" />
            <motion.span
              className="text-primary"
              variants={titleSpanVariants}
              style={{
                display: "inline-block",
                willChange: "transform",
              }}>
              in a New Dimension
            </motion.span>
          </h1>
        </motion.div>

        {isMobile && !continueOnMobile ? (
          <motion.div
            className="w-full max-w-md flex-shrink-0"
            variants={staggeredItemVariants}
            style={{ willChange: "transform" }}>
            <MobileWarning onContinue={handleContinueOnMobile} />
          </motion.div>
        ) : (
          <motion.div
            className="mx-auto w-fit flex-shrink-0"
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
                className="text-muted-foreground mt-1 mb-2 text-center text-xs sm:mt-2 sm:mb-3 sm:text-sm md:text-base"
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
              className="mt-2 flex items-center justify-center sm:mt-3 md:mt-4">
              <AnimatePresence mode="wait">
                {svgData && (
                  <motion.div
                    className="flex w-full justify-center overflow-hidden"
                    variants={continueButtonContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    style={{ willChange: "transform" }}>
                    <motion.div
                      className="flex w-full max-w-sm"
                      variants={continueButtonVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      style={{ willChange: "transform" }}>
                      <RainbowButton
                        className="mx-auto w-full max-w-[16rem] rounded-lg py-3 text-sm sm:py-4 sm:text-base md:py-5"
                        onClick={handleContinue}
                        disabled={isLoading}>
                        {isLoading ? "Processing..." : "Continue to Editor"}
                      </RainbowButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="flex-shrink-0"
        variants={staggeredItemVariants}
        style={{ willChange: "transform" }}>
        <Footer />
      </motion.div>
    </motion.main>
  );
}
