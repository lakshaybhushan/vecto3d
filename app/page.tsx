"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { Logo } from "@/components/ui/logo";
import { FileUpload } from "@/components/file-upload";
import { MobileWarning } from "@/components/mobile-warning";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Star } from "lucide-react";
import {
  staggerContainer,
  fadeUp,
  logoAnimation,
} from "@/lib/animation-values";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-numbers";
import { V0Icon, VercelIcon } from "@/components/ui/example-icons";
import { NotAScam } from "@/components/not-a-scam";

export default function Home() {
  const [svgData, setSvgData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stars, setStars] = useState(1000);
  const router = useRouter();
  const { isMobile, continueOnMobile, handleContinueOnMobile } =
    useMobileDetection();

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
    }, 300);
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
    }, 500);
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

        await new Promise((resolve) => setTimeout(resolve, 100));

        router.push("/edit");
      } catch (error) {
        console.error("Error during navigation:", error);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetch("https://api.github.com/repos/lakshaybhushan/vecto3d")
      .then((response) => response.json())
      .then((data) => {
        const starCount = data.stargazers_count;
        setStars(starCount);
      })
      .catch(() => setStars(0));
  }, []);

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.main
      className="min-h-screen flex flex-col relative w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      exit={{ opacity: 0 }}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                opacity: { duration: 0.2 },
              }}>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-xl font-medium">Preparing your 3D model...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        className="w-full py-6 px-6 md:px-12 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}>
        <motion.div
          className="flex items-center space-x-2"
          variants={logoAnimation}
          initial="hidden"
          animate="show">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">Vecto3d</span>
        </motion.div>
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <NotAScam />
          <ModeToggle />
          <Link
            href="https://github.com/lakshaybhushan/vecto3d"
            target="_blank"
            rel="noopener noreferrer">
            <Button className="flex items-center gap-1 w-fit">
              <Star size={16} />
              <AnimatedNumber
                className="inline-flex min-w-6 justify-end"
                springOptions={{
                  bounce: 0,
                  duration: 1200,
                }}
                value={stars}
              />    
              <span className="hidden sm:inline">Stars on GitHub</span>
              <FaGithub size={16} className="ml-0.5" />
            </Button>
          </Link>
        </motion.div>
      </motion.header>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-8"
        variants={containerAnimation}
        initial="hidden"
        animate="visible">
        <motion.div
          className="text-center mb-10 md:mb-12"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 80,
                duration: 0.5,
              },
            },
          }}>
          <motion.h1
            className="font-serif text-4xl md:text-5xl lg:text-7xl tracking-tight leading-tight md:leading-tight"
            variants={{
              hidden: { opacity: 0, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.5,
                  delay: 0.05,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
            }}>
            Transform Your Vectors <br className="hidden sm:block" />
            <motion.span
              className="text-primary"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.4,
                    delay: 0.15,
                    ease: "easeOut",
                  },
                },
              }}>
              in a New Dimension
            </motion.span>
          </motion.h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {isMobile && !continueOnMobile ? (
            <motion.div
              key="mobile-warning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}>
              <MobileWarning onContinue={handleContinueOnMobile} />
            </motion.div>
          ) : (
            <motion.div
              key="desktop-content"
              className="w-full max-w-4xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                    delay: 0.2,
                    staggerChildren: 0.15,
                    delayChildren: 0.25,
                  },
                },
              }}>
              <motion.div
                className="w-full"
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.98 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    },
                  },
                }}>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  fileName={fileName}
                  selectedIcon={selectedIcon}
                  onIconSelect={handleIconSelect}
                />
                <motion.p
                  className="text-base text-center text-muted-foreground mt-4 mb-6"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { delay: 0.3, duration: 0.3 },
                    },
                  }}>
                  *Works best with SVGs having simple geometry and transparent
                  background.
                </motion.p>
              </motion.div>

              <div
                id="continue-button-section"
                className="h-20 mb-8 mt-2 flex items-center justify-center">
                <AnimatePresence>
                  {svgData && (
                    <motion.div
                      key="continue-button"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                        mass: 1,
                        delay: 0.05,
                      }}
                      className="w-full flex justify-center">
                      <RainbowButton
                        className="max-w-xl w-full md:w-1/2 mx-auto text-md py-6"
                        onClick={handleContinue}
                        disabled={isLoading}>
                        <span className="flex items-center gap-2">
                          {isLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Continue to Editor <ArrowRight size={16} />
                            </>
                          )}
                        </span>
                      </RainbowButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="w-full py-6 px-6 md:px-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.4,
          ease: "easeOut",
        }}>
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show">
          <motion.div className="flex items-center gap-1" variants={fadeUp}>
            Hosted on{" "}
            <Link
              href="https://vercel.com"
              className="font-medium text-primary hover:underline flex items-center gap-0.5 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer">
              <VercelIcon size={12} />
              <span className="hidden sm:inline">Vercel</span>
            </Link>
          </motion.div>
          <motion.div
            className="flex items-center gap-1 mt-2 md:mt-0"
            variants={fadeUp}>
            Ideated with{" "}
            <Link
              href="https://v0.dev/chat/three-js-logo-converter-JEQ692TQD4t"
              className="font-medium text-primary hover:underline flex items-center transition-colors duration-200 gap-2"
              target="_blank"
              rel="noopener noreferrer">
              <span className="sm:inline">
                <V0Icon size={20} />
              </span>
            </Link>
            <span className="text-muted-foreground">by</span>
            <Link
              href="https://lakshb.dev"
              className="hover:underline font-medium hover:text-primary transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer">
              lakshaybhushan
            </Link>
          </motion.div>
        </motion.div>
      </motion.footer>
    </motion.main>
  );
}
