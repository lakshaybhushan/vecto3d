// Animation variants for staggered children
export const staggerContainer = (
  staggerChildren?: number,
  delayChildren?: number
) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

// Fade up animation - good for text and UI components
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

// Scale animation - good for buttons and UI elements that need emphasis
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

// Slide in from right - good for sequential items
export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// 3D model container animation
export const modelContainerAnimation = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Logo animation
export const logoAnimation = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100,
    },
  },
};

// Button animation with hover effect
export const buttonAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 400,
    },
  },
  tap: { scale: 0.98 },
};

// List item stagger animation
export const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

// Card animation
export const cardAnimation = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

// Tab content transition
export const tabContentAnimation = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};
