"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Shirt,
  Watch,
  Smartphone,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { categoryService } from "@/services/category/categoryService";
import { CategoryType } from "@/types";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

// Default icons for each category
const categoryIcons: Record<string, React.ElementType> = {
  All: Home,
  Clothing: Shirt,
  Accessories: Watch,
  Electronics: Smartphone,
};

// Animation variants
const sidebarVariants = {
  open: {
    width: "18rem",
  },
  closed: {
    width: "4rem",
  },
};

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
  },
  closed: {
    opacity: 0,
    x: -20,
  },
};

const staggerVariants = {
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

const itemVariants = {
  open: {
    x: 0,
    opacity: 1,
  },
  closed: {
    x: -10,
    opacity: 0,
  },
};

export function Sidebar() {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    hideSidebar,
    isCollapsed,
    setIsCollapsed,
  } = useSidebar();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchCategories();
    }
  }, [mounted]);

  if (!mounted || hideSidebar) {
    return null;
  }

  // Mapping of categories from DB to display with icons and hrefs
  const categoryItems = [
    { name: "All", icon: Home, href: "/" },
    ...categories.map((category) => ({
      name: category.name,
      icon: categoryIcons[category.name] || Smartphone,
      href: `/${category.name.toLowerCase()}`,
    })),
  ];

  // Filter categories based on authentication status
  const displayCategories = user
    ? categoryItems
    : categoryItems.filter((category) =>
        ["All", "Electronics"].includes(category.name),
      );

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="bg-background/95 border-border/50 fixed top-4 left-4 z-50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl sm:hidden"
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

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
        className={cn(
          "bg-background/95 border-border/50 fixed top-16 left-0 z-40 flex h-[calc(100vh-4rem)] flex-col border-r shadow-xl backdrop-blur-xl",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full sm:translate-x-0",
        )}
      >
        {/* Header with logo and collapse button */}
        <div className="border-border/50 bg-muted/30 flex items-center justify-between border-b p-4">
          <motion.div
            variants={contentVariants}
            className="flex items-center space-x-2.5"
          >
            <div className="from-primary to-primary/80 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <span className="text-primary-foreground text-base font-bold">
                E
              </span>
            </div>
            {!isCollapsed && (
              <motion.div variants={itemVariants} className="flex flex-col">
                <span className="text-foreground text-base font-semibold">
                  E-Store
                </span>
                <span className="text-muted-foreground text-xs">
                  Premium Shop
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hover:bg-muted/50 hidden h-8 w-8 transition-all duration-200 sm:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="text-muted-foreground h-4 w-4" />
            </motion.div>
          </Button>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-border/30 border-b px-4 py-3"
            >
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="bg-muted/50 border-border/50 focus:bg-background w-full pl-9 text-sm transition-all duration-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <motion.nav
            variants={staggerVariants}
            initial="closed"
            animate={isCollapsed ? "closed" : "open"}
          >
            {!isCollapsed && (
              <motion.h3
                variants={itemVariants}
                className="text-muted-foreground mb-3 px-3 text-xs font-medium tracking-wider uppercase"
              >
                Categories
              </motion.h3>
            )}

            {loading ? (
              <div className="animate-pulse space-y-2 px-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "bg-muted rounded-lg",
                      isCollapsed ? "h-10 w-10" : "h-10",
                    )}
                  />
                ))}
              </div>
            ) : (
              <motion.div variants={staggerVariants} className="space-y-1">
                {displayCategories.map((category) => {
                  const isActive = pathname === category.href;
                  const Icon = category.icon;

                  return (
                    <motion.div key={category.name} variants={itemVariants}>
                      <Link
                        href={category.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "group relative h-11 w-full cursor-pointer justify-start overflow-hidden transition-all duration-200",
                            isCollapsed ? "justify-center px-2" : "",
                            isActive
                              ? "bg-primary/10 text-primary border-primary/20 border shadow-sm"
                              : "hover:bg-muted/70 hover:translate-x-1",
                          )}
                          title={isCollapsed ? category.name : undefined}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-all duration-200",
                              isCollapsed ? "mr-0" : "mr-3",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />

                          {!isCollapsed && (
                            <span className="flex-1 text-left text-sm font-medium">
                              {category.name}
                            </span>
                          )}

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="bg-primary absolute right-2 h-2 w-2 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}

                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="bg-foreground text-background invisible absolute left-full z-50 ml-2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                              {category.name}
                              <div className="bg-foreground absolute top-1/2 left-0 h-1.5 w-1.5 -translate-x-1 -translate-y-1/2 rotate-45 transform" />
                            </div>
                          )}
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.nav>
        </ScrollArea>

        {/* User section */}
        {user && (
          <div className="border-border/50 bg-muted/20 border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {!isCollapsed ? (
                  <motion.div
                    variants={contentVariants}
                    className="bg-background/60 hover:bg-background/80 group border-border/30 flex cursor-pointer items-center rounded-xl border p-3 shadow-sm transition-all duration-200"
                  >
                    <Avatar className="ring-primary/20 h-9 w-9 ring-2">
                      <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 w-2 rounded-full bg-green-500"
                        title="Online"
                      />
                      <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors duration-200" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="group flex cursor-pointer justify-center">
                    <div className="relative">
                      <Avatar className="ring-primary/20 group-hover:ring-primary/40 h-10 w-10 ring-2 transition-all duration-200">
                        <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                    </div>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="bg-background/95 border-border/50 w-56 backdrop-blur-xl"
              >
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="focus:bg-muted/70 cursor-pointer"
                  onClick={() => router.replace("/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer transition-colors duration-200 focus:bg-red-50 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.aside>
    </>
  );
}
