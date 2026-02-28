"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

// Fade + slight scale animation for smooth transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Card slide-up animation for login/register modals
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Backdrop fade animation
export const backdropVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CardTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={cardVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BackdropTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={backdropVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

