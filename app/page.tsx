"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { MobileWarning } from "@/components/mobile-warning";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Footer from "@/components/footer";
import Nav from "@/components/nav";
import AnimatedLogo from "@/components/ui/animated-logo";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [svgData, setSvgData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
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
    }, 300);
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

        console.log(`Waiting ${delayMs}ms for animation to complete...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        router.push("/edit");
      } catch (error) {
        console.error("Error during navigation:", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col relative w-full">
      <Nav />

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <AnimatedLogo
              size={128}
              className="text-primary"
              isLoading={true}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl lg:text-7xl leading-tighter text-primary">
            Transform Your Vectors <br className="hidden sm:block" />
            <span className="text-primary">in a New Dimension</span>
          </h1>
        </div>

        {isMobile && !continueOnMobile ? (
          <div className="w-full">
            <MobileWarning onContinue={handleContinueOnMobile} />
          </div>
        ) : (
          <div className="w-fit mx-auto">
            <div className="w-full">
              <FileUpload
                onFileUpload={handleFileUpload}
                fileName={fileName}
                selectedIcon={selectedIcon}
                onIconSelect={handleIconSelect}
              />
              <p className="text-base text-center text-muted-foreground mt-4 mb-4">
                Works best with SVGs having simple geometry and transparent
                background
              </p>
            </div>

            <div
              id="continue-button-section"
              className="flex items-center justify-center">
              {svgData && (
                <div className="w-full flex justify-center">
                  <RainbowButton
                    className="max-w-lg w-full md:w-1/2 mx-auto text-md py-6"
                    onClick={handleContinue}
                    disabled={isLoading}>
                    <span className="flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                        </>
                      ) : (
                        "Continue to Editor"
                      )}
                    </span>
                  </RainbowButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
