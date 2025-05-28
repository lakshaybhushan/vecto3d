import { easingCurves } from "./animation-values";

export const pageVariants = {
  hero: {
    initial: {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: easingCurves.easeOutQuart,
        delay: 0.1,
      },
    },
  },

  title: {
    initial: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: easingCurves.easeOutCubic,
        delay: 0.2,
      },
    },
  },

  content: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.3,
        staggerChildren: 0.08,
        delayChildren: 0.4,
      },
    },
  },
} as const;

export const navigationVariants = {
  initial: {
    opacity: 0,
    y: -15,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: easingCurves.easeOutCubic,
    },
  },
} as const;

export const footerVariants = {
  initial: {
    opacity: 0,
    y: 15,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: easingCurves.easeOutCubic,
      delay: 0.8,
    },
  },
} as const;

export const loadingOverlayVariants = {
  initial: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  animate: {
    opacity: 1,
    backdropFilter: "blur(16px)",
    transition: {
      duration: 0.3,
      ease: easingCurves.easeOutCubic,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: easingCurves.easeInCubic,
    },
  },
} as const;

export const loadingLogoVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    filter: "blur(4px)",
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: easingCurves.easeOutCubic,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: easingCurves.easeInCubic,
    },
  },
} as const;

export const titleSpanVariants = {
  first: {
    initial: {
      opacity: 0,
      y: 15,
      filter: "blur(4px)",
      transform: "translate3d(0, 0, 0)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transform: "translate3d(0, 0, 0)",
      transition: {
        duration: 0.4,
        ease: easingCurves.easeOutQuart,
        delay: 0.3,
      },
    },
  },
  second: {
    initial: {
      opacity: 0,
      y: 15,
      filter: "blur(4px)",
      transform: "translate3d(0, 0, 0)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transform: "translate3d(0, 0, 0)",
      transition: {
        duration: 0.4,
        ease: easingCurves.easeOutQuart,
        delay: 0.4,
      },
    },
  },
} as const;

export const fileUploadVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(6px)",
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.5,
      ease: easingCurves.easeOutQuart,
      delay: 0.5,
    },
  },
} as const;

export const helpTextVariants = {
  initial: {
    opacity: 0,
    filter: "blur(3px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      delay: 0.6,
    },
  },
} as const;

export const continueButtonVariants = {
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.95,
    filter: "blur(4px)",
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.4,
      ease: easingCurves.easeOutCubic,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: easingCurves.easeInCubic,
    },
  },
} as const;

export const buttonInteractionVariants = {
  whileHover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easingCurves.easeOutCubic,
    },
  },
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: easingCurves.easeInOutQuart,
    },
  },
} as const;

export const backgroundVariants = {
  initial: {
    opacity: 0,
    scale: 1.05,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: easingCurves.easeOutQuart,
    },
  },
} as const;

export const backgroundCanvasVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: easingCurves.easeOutCubic,
      delay: 0.2,
    },
  },
} as const;

export const staggeredContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggeredItemVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: "blur(3px)",
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.4,
      ease: easingCurves.easeOutCubic,
    },
  },
} as const;
