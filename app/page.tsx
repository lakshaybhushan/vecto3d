"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const FileUpload = dynamic(
  () =>
    import("@/components/forms/file-upload").then((mod) => ({
      default: mod.FileUpload,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed sm:h-[220px] md:h-[260px] lg:h-[300px]">
        <div className="flex max-w-xs flex-col items-center gap-4 px-4 text-center">
          <div className="relative h-14 w-14">
            <div className="bg-background/20 absolute inset-0 animate-pulse rounded-full"></div>
            <div className="bg-background/40 absolute inset-4 animate-pulse rounded-full [animation-delay:200ms]"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Loading file upload...</p>
            <p className="text-muted-foreground text-xs">
              Initializing component
            </p>
          </div>
        </div>
      </div>
    ),
  },
);
import { MobileWarning } from "@/components/modals/mobile-warning";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Footer from "@/components/layouts/footer";
import Nav from "@/components/layouts/nav";
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

  const continueButtonSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToContinueButton = () => {
    if (continueButtonSectionRef.current) {
      continueButtonSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleFileUpload = (data: string, name: string) => {
    setSvgData(data);
    setFileName(name);
    scrollToContinueButton();
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    scrollToContinueButton();
  };

  const handleContinue = async () => {
    if (svgData) {
      setIsLoading(true);

      try {
        // Play audio when loading starts
        const audio = new Audio("/continue.mp3");
        audio.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      } catch (error) {
        console.log("Audio initialization failed:", error);
      }

      try {
        const { setSvgData, setFileName } = useEditorStore.getState();
        // Clear any existing session storage before setting new data
        sessionStorage.removeItem("vecto3d_svgData");
        sessionStorage.removeItem("vecto3d_fileName");
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
      exit="exit">
      <BackgroundEffect />

      <motion.div className="flex-shrink-0" variants={staggeredItemVariants}>
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
        style={{ minHeight: 0 }}>
        <motion.div
          className="mb-4 text-center md:mb-6"
          variants={titleContainerVariants}
          initial="initial"
          animate="animate">
          <h1 className="text-primary leading-tighter font-serif text-5xl tracking-tight md:text-6xl">
            <motion.span
              variants={titleSpanVariants}
              style={{
                display: "inline-block",
              }}>
              Transform Your Vectors{" "}
            </motion.span>
            <br className="hidden sm:block" />
            <motion.span
              className="text-primary"
              variants={titleSpanVariants}
              style={{
                display: "inline-block",
              }}>
              in a New Dimension
            </motion.span>
          </h1>
        </motion.div>

        {isMobile && !continueOnMobile ? (
          <motion.div
            className="w-full max-w-md flex-shrink-0"
            variants={staggeredItemVariants}>
            <MobileWarning onContinue={handleContinueOnMobile} />
          </motion.div>
        ) : (
          <motion.div
            className="mx-auto w-fit flex-shrink-0"
            variants={staggeredItemVariants}>
            <motion.div
              className="w-full"
              variants={fileUploadVariants}
              initial="initial"
              animate="animate">
              <FileUpload
                onFileUpload={handleFileUpload}
                fileName={fileName}
                selectedIcon={selectedIcon}
                onIconSelect={handleIconSelect}
              />
              <motion.p
                className="text-muted-foreground mt-2 mb-2 text-center text-sm text-balance sm:mt-2 sm:mb-3 sm:text-sm md:text-base"
                variants={helpTextVariants}
                initial="initial"
                animate="animate">
                Works best with SVGs having simple geometry and transparent
                background
              </motion.p>
            </motion.div>

            <motion.div
              ref={continueButtonSectionRef}
              className="mt-5 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {svgData && (
                  <motion.div
                    className="flex w-full justify-center overflow-hidden"
                    variants={continueButtonContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout>
                    <motion.div
                      className="flex w-full max-w-sm"
                      variants={continueButtonVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout>
                      <RainbowButton
                        className="mx-auto w-full max-w-[16rem] rounded-md py-5"
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

      <motion.div className="flex-shrink-0" variants={staggeredItemVariants}>
        <Footer />
      </motion.div>
    </motion.main>
  );
}
