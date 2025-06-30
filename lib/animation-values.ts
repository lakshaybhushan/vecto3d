export const easingCurves = {
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeInQuart: [0.895, 0.03, 0.685, 0.22],
  easeInQuint: [0.755, 0.05, 0.855, 0.06],
  easeInExpo: [0.95, 0.05, 0.795, 0.035],
  easeInCirc: [0.6, 0.04, 0.98, 0.335],

  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeOutCirc: [0.075, 0.82, 0.165, 1],

  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
  easeInOutExpo: [1, 0, 0, 1],
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
} as const;

export const springConfigs = {
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 120,
    damping: 22,
    mass: 1,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
    mass: 0.8,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.6,
  },
  appleLike: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.5,
    velocity: 0,
  },
  appleGentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 35,
    mass: 0.8,
    velocity: 0,
  },
  iosSheet: {
    type: "spring" as const,
    stiffness: 500,
    damping: 40,
    mass: 0.4,
    velocity: 0,
  },
} as const;

export const pageTransitions = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
} as const;

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const;

export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easingCurves.easeOutQuart,
    },
  },
} as const;

export const fadeInScale = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easingCurves.easeOutCubic,
    },
  },
} as const;

export const slideInFromLeft = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easingCurves.easeOutQuint,
    },
  },
} as const;

export const slideInFromRight = {
  initial: {
    opacity: 0,
    x: 60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easingCurves.easeOutQuint,
    },
  },
} as const;
