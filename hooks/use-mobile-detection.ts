import { useState, useEffect } from "react";

export function useMobileDetection(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [continueOnMobile, setContinueOnMobile] = useState<boolean>(false);

  // Detect mobile device on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on initial load (client-side only)
    if (typeof window !== "undefined") {
      checkIsMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkIsMobile);

      // Check if user has explicitly continued on mobile
      const mobilePreference = localStorage.getItem("continueOnMobile");
      setContinueOnMobile(mobilePreference === "true");
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkIsMobile);
      }
    };
  }, [breakpoint]);

  // Function to handle continuing on mobile
  const handleContinueOnMobile = () => {
    setContinueOnMobile(true);
    localStorage.setItem("continueOnMobile", "true");
  };

  // Function to clear mobile preference
  const clearMobilePreference = () => {
    setContinueOnMobile(false);
    localStorage.removeItem("continueOnMobile");
  };

  return {
    isMobile,
    continueOnMobile,
    handleContinueOnMobile,
    clearMobilePreference,
  };
}

export function useSafariDetection() {
  const [isSafari, setIsSafari] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent;
      const isSafariBrowser =
        /Safari/.test(userAgent) &&
        !/Chrome/.test(userAgent) &&
        !/Edge/.test(userAgent);
      setIsSafari(isSafariBrowser);
    }
  }, []);

  return isSafari;
}

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
      setIsIOS(isIOSDevice);
    }
  }, []);

  return isIOS;
}

export function useFullscreenSupport() {
  const [isFullscreenSupported, setIsFullscreenSupported] =
    useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasFullscreenSupport = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
      setIsFullscreenSupported(hasFullscreenSupport);
    }
  }, []);

  return isFullscreenSupported;
}
