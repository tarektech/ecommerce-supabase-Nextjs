// Animation variants
export const sidebarVariants = {
    open: {
      width: "18rem",
    },
    closed: {
      width: "4rem",
    },
  };
  
  export const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
    },
    closed: {
      opacity: 0,
      x: -20,
    },
  };
  
  export const staggerVariants = {
    open: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  };
  
  export const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
    },
    closed: {
      x: -10,
      opacity: 0,
    },
  };
  
  export const mobileButtonVariants = {
    open: { rotate: 90 },
    closed: { rotate: 0 },
  };
  
  export const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };
  
  export const searchVariants = {
    open: { opacity: 1, height: "auto" },
    closed: { opacity: 0, height: 0 },
  };
  
  export const indicatorVariants = {
    open: { scale: 1 },
    closed: { scale: 0 },
  };
  
  export const collapseButtonVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  };