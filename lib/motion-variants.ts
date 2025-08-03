import { springConfigs } from "./animation-values";

export const pageVariants = {
  hero: {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        ...springConfigs.smooth,
        delay: 0.1,
      },
    },
  },

  title: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.1,
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
        ...springConfigs.smooth,
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
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.snappy,
    },
  },
} as const;

export const footerVariants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.gentle,
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
      ...springConfigs.smooth,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      ...springConfigs.snappy,
    },
  },
} as const;

export const loadingLogoVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      ...springConfigs.bouncy,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      ...springConfigs.snappy,
    },
  },
} as const;

export const titleContainerVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.gentle,
      delay: 0.2,
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
} as const;

export const titleSpanVariants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.smooth,
    },
  },
} as const;

export const fileUploadVariants = {
  initial: {
    opacity: 0,
    y: 20,
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: {
      ...springConfigs.gentle,
      delay: 0.5,
    },
  },
} as const;

export const helpTextVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      ...springConfigs.smooth,
      delay: 0.6,
    },
  },
} as const;

export const continueButtonContainerVariants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        ...springConfigs.snappy,
        duration: 0.25,
      },
      opacity: {
        ...springConfigs.snappy,
        delay: 0.02,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        ...springConfigs.snappy,
        duration: 0.2,
      },
      opacity: {
        ...springConfigs.snappy,
        duration: 0.1,
      },
    },
  },
} as const;

export const continueButtonVariants = {
  initial: {
    opacity: 0,
    y: 8,
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: {
      ...springConfigs.snappy,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -3,
    transition: {
      ...springConfigs.snappy,
      duration: 0.15,
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
      ...springConfigs.gentle,
      duration: 1.2,
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
      ...springConfigs.smooth,
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
      ...springConfigs.smooth,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggeredItemVariants = {
  initial: {
    opacity: 0,
    y: 12,
    transform: "translate3d(0, 0, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: {
      ...springConfigs.smooth,
    },
  },
} as const;

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      ...springConfigs.snappy,
    },
  },
} as const;
