"use client";
import { AnimatePresence } from "motion/react";
import { Motion } from "./motion/motion";
import { searchVariants } from "./motion/animation-variants";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useSidebar } from "./ui/sidebar";


export default function SidebarSearch() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
  return (
    <div className="px-3">
    <AnimatePresence>
      {!isCollapsed && (
        <Motion
          variants={searchVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ duration: 0.3 }}
          className="pb-2"
        >
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search products..."
              className="bg-muted/50 border-border/50 focus:bg-background w-full pl-9 text-sm transition-all duration-200"
            />
          </div>
        </Motion>
      )}
    </AnimatePresence>
  </div>
  );
}