"use client";
import { ShoppingCart, Moon, Sun, Menu, User, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Navbar() {
  const { totalItems } = useCart();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 z-60 w-full border-b backdrop-blur"> 
      <div className="mx-4 flex h-16 items-center">
        <div className="flex items-center gap-2">
        <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="bg-background/95 border-border/50  z-50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl sm:hidden"
        aria-label="Toggle sidebar"
      >
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="text-foreground h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="text-foreground h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
          <Link href="/" className="flex cursor-pointer items-center">
            <h1 className="text-2xl font-bold">ShopClone</h1>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <User className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{user ? "Profile" : "Sign in"}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={() => router.push("/signup")}
            >
              <LogIn className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Sign in</span>
            </Button>
          )}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 cursor-pointer"
            >
              <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-medium">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
