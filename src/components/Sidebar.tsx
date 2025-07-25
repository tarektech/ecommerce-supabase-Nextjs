"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import {
  Home,
  Shirt,
  Watch,
  Smartphone,
  Search,
  LogOut,
  LayoutDashboard,
  Settings,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { categoryService } from "@/services/category/categoryService";
import { CategoryType } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { Motion } from "@/components/motion/motion";
import {
  contentVariants,
  staggerVariants,
  itemVariants,
  searchVariants,
  indicatorVariants,
} from "@/components/motion/animation-variants";

// Default icons for each category
const categoryIcons: Record<string, React.ElementType> = {
  All: Home,
  Clothing: Shirt,
  Accessories: Watch,
  Electronics: Smartphone,
};

export default function Sidebar() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

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

  if (!mounted) {
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

  // Admin navigation items
  const adminNavItems = [
    { name: "Admin Dashboard", icon: Settings, href: "/admin" },
    { name: "Products", icon: Package, href: "/admin/products" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Users", icon: Users, href: "/admin/users" },
  ];

  return (
    <ShadcnSidebar collapsible="icon" className="z-[70] border-r">
      {/* Header with logo */}
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Motion
            variants={contentVariants}
            initial={isCollapsed ? "closed" : "open"}
            animate={isCollapsed ? "closed" : "open"}
            className="flex items-center space-x-2.5"
          >
            <div className="from-primary to-primary/80 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <span className="text-primary-foreground text-base font-bold">
                E
              </span>
            </div>
            {!isCollapsed && (
              <Motion
                variants={itemVariants}
                initial="closed"
                animate="open"
                className="flex flex-col"
              >
                <span className="text-foreground text-base font-semibold">
                  E-Store
                </span>
                <span className="text-muted-foreground text-xs">
                  Premium Shop
                </span>
              </Motion>
            )}
          </Motion>

          {!isCollapsed && (
            <SidebarTrigger className="hover:bg-muted/50 ml-auto transition-colors duration-200" />
          )}
        </div>
      </SidebarHeader>

      {/* Search Bar */}
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

      <SidebarContent>
        <Motion
          variants={staggerVariants}
          initial="closed"
          animate={isCollapsed ? "closed" : "open"}
          className="space-y-4"
        >
          {/* Admin Navigation */}
          {user && isAdmin && (
            <SidebarGroup>
              {!isCollapsed && (
                <Motion variants={itemVariants} initial="closed" animate="open">
                  <SidebarGroupLabel className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Administration
                  </SidebarGroupLabel>
                </Motion>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  <Motion
                    variants={staggerVariants}
                    initial="closed"
                    animate="open"
                  >
                    {adminNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Motion
                          key={item.name}
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                "group relative transition-all duration-200",
                                isActive
                                  ? "border-primary/20 bg-primary/10 text-primary border"
                                  : "hover:translate-x-1",
                              )}
                              tooltip={item.name}
                            >
                              <Link href={item.href}>
                                <Icon
                                  className={cn(
                                    "h-4 w-4 transition-all duration-200",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-foreground",
                                  )}
                                />
                                {!isCollapsed && (
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                )}
                                {/* Active indicator */}
                                {isActive && (
                                  <Motion
                                    variants={indicatorVariants}
                                    initial="closed"
                                    animate="open"
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="bg-primary absolute right-2 h-2 w-2 rounded-full"
                                  />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </Motion>
                      );
                    })}
                  </Motion>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Categories Navigation */}
          <SidebarGroup>
            {!isCollapsed && (
              <Motion variants={itemVariants} initial="closed" animate="open">
                <SidebarGroupLabel className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Categories
                </SidebarGroupLabel>
              </Motion>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <div className="animate-pulse space-y-2">
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
                  <Motion
                    variants={staggerVariants}
                    initial="closed"
                    animate="open"
                  >
                    {displayCategories.map((category) => {
                      const isActive = pathname === category.href;
                      const Icon = category.icon;

                      return (
                        <Motion
                          key={category.name}
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                "group relative transition-all duration-200",
                                isActive
                                  ? "bg-primary/10 text-primary border-primary/20 border"
                                  : "hover:translate-x-1",
                              )}
                              tooltip={category.name}
                            >
                              <Link href={category.href}>
                                <Icon
                                  className={cn(
                                    "h-4 w-4 transition-all duration-200",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-foreground",
                                  )}
                                />
                                {!isCollapsed && (
                                  <span className="text-sm font-medium">
                                    {category.name}
                                  </span>
                                )}
                                {/* Active indicator */}
                                {isActive && (
                                  <Motion
                                    variants={indicatorVariants}
                                    initial="closed"
                                    animate="open"
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="bg-primary absolute right-2 h-2 w-2 rounded-full"
                                  />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </Motion>
                      );
                    })}
                  </Motion>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Motion>
      </SidebarContent>

      {/* User section */}
      {user && (
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {!isCollapsed ? (
                <Motion
                  variants={contentVariants}
                  initial={isCollapsed ? "closed" : "open"}
                  animate={isCollapsed ? "closed" : "open"}
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
                </Motion>
              ) : (
                <SidebarMenuButton
                  size="lg"
                  className="group cursor-pointer"
                  tooltip={`${user.email?.split("@")[0] || "User"}`}
                >
                  <div className="relative">
                    <Avatar className="ring-primary/20 group-hover:ring-primary/40 h-8 w-8 ring-2 transition-all duration-200">
                      <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                  </div>
                </SidebarMenuButton>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              sideOffset={8}
              className="bg-background/95 border-border/50 z-[80] w-56 backdrop-blur-xl"
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
                onClick={() => router.replace("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-muted/70 cursor-pointer"
                onClick={() => router.replace("/cart")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Cart</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-muted/70 cursor-pointer"
                onClick={() => router.replace("/dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  className="focus:bg-muted/70 cursor-pointer"
                  onClick={() => router.replace("/admin")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={signOut}
                className="focus:bg-muted/70 cursor-pointer transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </ShadcnSidebar>
  );
}
