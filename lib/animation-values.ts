// Animation variants for staggered children
export const staggerContainer = (
  staggerChildren?: number,
  delayChildren?: number,
) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

// Fade up animation with blur effect
export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      filter: { duration: 0.4 },
    },
  },
};

// Scale animation with blur effect
export const scaleUp = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(5px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      filter: { duration: 0.5, ease: "easeOut" },
    },
  },
};

// Slide in from right with blur
export const slideRight = {
  hidden: {
    opacity: 0,
    x: -20,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      filter: { duration: 0.4 },
    },
  },
};

// Page transition variants with blur
export const pageTransition = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smoother motion
      filter: { duration: 0.5 },
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

// 3D model container animation with enhanced blur
export const modelContainerAnimation = {
  hidden: {
    opacity: 0,
    filter: "blur(12px)",
    scale: 0.97,
  },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      scale: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  },
};

// Logo animation with blur and rotation
export const logoAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100,
      filter: { duration: 0.3 },
    },
  },
};

// Button animation with hover effect and blur
export const buttonAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(5px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
      filter: { duration: 0.4 },
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 400,
    },
  },
  tap: { scale: 0.98 },
};

// List item stagger animation with blur
export const listItem = {
  hidden: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      filter: { duration: 0.3 },
    },
  },
};

// Card animation with depth effect and blur
export const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(8px)",
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      filter: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  },
};

// Tab content transition with enhanced blur
export const tabContentAnimation = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      filter: { duration: 0.4, ease: "easeOut" },
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(8px)",
    transition: {
      duration: 0.3,
      filter: { duration: 0.2 },
    },
  },
};
