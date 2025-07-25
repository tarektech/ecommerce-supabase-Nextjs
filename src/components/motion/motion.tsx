import {
  AnimatePresence,
  motion,
  Transition,
  Variants,
  HTMLMotionProps,
} from "motion/react"; 

import React, { ReactNode } from "react";

type MotionProps = {
  children?: ReactNode;
  variants: Variants;
  initial: string;
  animate: string;
  exit?: string;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTap?: () => void;
  onTapStart?: () => void;
  onDragStart?: () => void;
  asChild?: boolean;
} & Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "animate" | "exit" | "transition" | "children"
>;

export function Motion({
  children,
  variants,
  initial,
  animate,
  exit,
  transition,
  className,
  style,
  onClick,
  onHoverStart,
  onHoverEnd,
  onTap,
  onTapStart,
  onDragStart,
  asChild,
  ...motionProps
}: MotionProps) {
  return (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
        style={style}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onTap={onTap}
        onTapStart={onTapStart}
        onDragStart={onDragStart}
        {...motionProps}
      >
        {asChild ? children : <motion.div {...motionProps}>{children}</motion.div>}
      </motion.div>
    </AnimatePresence>
  );
}