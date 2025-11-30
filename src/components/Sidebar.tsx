"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Shirt,
  Watch,
  Smartphone,
  Settings,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
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
import { usePathname } from "next/navigation";
import { Motion } from "@/components/motion/motion";
import {
  contentVariants,
  staggerVariants,
  itemVariants,
  indicatorVariants,
} from "@/components/motion/animation-variants";
import SidebarUser from "./sidebar-user";
import SidebarSearch from "./sidebar-search";

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
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
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
      <SidebarSearch />


      {/* Main Content */}
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
                    className="mt-10"
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

      {/* User Section */}
      <SidebarUser />

      <SidebarRail />
    </ShadcnSidebar>
  );
}
