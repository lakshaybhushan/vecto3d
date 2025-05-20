// Animation variants for staggered children
export const staggerContainer = (
  staggerChildren?: number,
  delayChildren?: number
) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.06,
      delayChildren: delayChildren || 0,
    },
  },
});

// Apple-style easing curves
export const appleEaseOut = [0.25, 0.1, 0.25, 1];
export const appleEaseIn = [0.42, 0, 1, 1];
export const appleEaseInOut = [0.42, 0, 0.58, 1];
export const appleSpring = [0.175, 0.885, 0.32, 1.275];

// Enhanced fadeUp animation with improved blur effect
export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(3px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 200,
      duration: 0.25,
      filter: { duration: 0.2, ease: appleEaseOut },
    },
    willChange: "auto",
  },
};

// Scale animation with blur effect
export const scaleUp = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    filter: "blur(2px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.22,
      ease: appleEaseOut,
      filter: { duration: 0.18, ease: appleEaseOut },
    },
    willChange: "auto",
  },
};

// Slide in from right with blur
export const slideRight = {
  hidden: {
    opacity: 0,
    x: -10,
    filter: "blur(2px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.22,
      ease: appleEaseOut,
      filter: { duration: 0.18 },
    },
    willChange: "auto",
  },
};

// Page transition variants with blur
export const pageTransition = {
  initial: {
    opacity: 0,
    filter: "blur(3px)",
    willChange: "opacity, filter",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.28,
      ease: appleEaseOut,
      filter: { duration: 0.22 },
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
    willChange: "auto",
  },
  exit: {
    opacity: 0,
    filter: "blur(3px)",
    transition: {
      duration: 0.2,
      ease: appleEaseIn,
    },
  },
};

// 3D model container animation with enhanced blur
export const modelContainerAnimation = {
  hidden: {
    opacity: 0,
    filter: "blur(3px)",
    scale: 0.98,
    willChange: "opacity, transform, filter",
  },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.3,
      ease: appleEaseOut,
      scale: { duration: 0.28, ease: appleEaseOut },
      filter: { duration: 0.22, ease: appleEaseOut },
    },
    willChange: "auto",
  },
};

// Logo animation with blur and rotation
export const logoAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    rotate: -2,
    filter: "blur(2px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      duration: 0.25,
      filter: { duration: 0.18 },
    },
    willChange: "auto",
  },
};

// Button animation with hover effect and blur
export const buttonAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    filter: "blur(2px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.22,
      ease: appleEaseOut,
      filter: { duration: 0.18 },
    },
    willChange: "auto",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.06)",
    transition: {
      type: "tween",
      duration: 0.2,
      ease: appleEaseOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "tween",
      duration: 0.1,
      ease: appleEaseOut,
    },
  },
};

// List item stagger animation with blur
export const listItem = {
  hidden: {
    opacity: 0,
    x: -8,
    filter: "blur(2px)",
    willChange: "opacity, transform",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.22,
      ease: appleEaseOut,
      filter: { duration: 0.18 },
    },
    willChange: "auto",
  },
};

// Card animation with depth effect and blur
export const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 15,
    filter: "blur(3px)",
    scale: 0.98,
    willChange: "opacity, transform, filter",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      type: "tween",
      duration: 0.25,
      ease: appleEaseOut,
      filter: { duration: 0.2 },
      scale: { duration: 0.25 },
    },
    willChange: "auto",
  },
};

// Tab content transition with enhanced blur
export const tabContentAnimation = {
  hidden: {
    opacity: 0,
    y: 4,
    filter: "blur(2px)",
    willChange: "opacity, transform, filter",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.22,
      ease: appleEaseOut,
      filter: { duration: 0.18, ease: appleEaseOut },
    },
    willChange: "auto",
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: "blur(2px)",
    transition: {
      duration: 0.18,
      ease: appleEaseIn,
      filter: { duration: 0.14 },
    },
  },
};

// Special file input animation to prevent flickering
export const fileInputAnimation = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    willChange: "opacity, transform",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "tween",
      duration: 0.25,
      ease: appleEaseOut,
    },
    willChange: "auto",
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: appleEaseIn,
    },
  },
};
