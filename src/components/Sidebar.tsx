'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { categoryService } from '@/services/category/categoryService';
import { CategoryType } from '@/types';
import { useSidebar } from '@/context/SidebarContext';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
    width: '18rem',
  },
  closed: {
    width: '4rem',
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
        console.error('Error fetching categories:', error);
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
    { name: 'All', icon: Home, href: '/' },
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
        ['All', 'Electronics'].includes(category.name)
      );

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 sm:hidden bg-background/95 backdrop-blur-sm shadow-lg border-border/50 hover:shadow-xl transition-all duration-200"
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
              <X className="h-5 w-5 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5 text-foreground" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 sm:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isCollapsed ? 'closed' : 'open'}
        animate={isCollapsed ? 'closed' : 'open'}
        variants={sidebarVariants}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
        className={cn(
          'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur-xl border-r border-border/50 z-40 flex flex-col shadow-xl',
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full sm:translate-x-0'
        )}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <motion.div
            variants={contentVariants}
            className="flex items-center space-x-2.5"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-base">
                E
              </span>
            </div>
            {!isCollapsed && (
              <motion.div variants={itemVariants} className="flex flex-col">
                <span className="font-semibold text-foreground text-base">
                  E-Store
                </span>
                <span className="text-xs text-muted-foreground">
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
            className="hidden sm:flex h-8 w-8 hover:bg-muted/50 transition-all duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </Button>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-3 border-b border-border/30"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 text-sm bg-muted/50 border-border/50 focus:bg-background transition-all duration-200"
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
            animate={isCollapsed ? 'closed' : 'open'}
          >
            {!isCollapsed && (
              <motion.h3
                variants={itemVariants}
                className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3"
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
                      'bg-muted rounded-lg',
                      isCollapsed ? 'h-10 w-10' : 'h-10'
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
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start h-11 group cursor-pointer relative overflow-hidden transition-all duration-200',
                            isCollapsed ? 'justify-center px-2' : '',
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                              : 'hover:bg-muted/70 hover:translate-x-1'
                          )}
                          title={isCollapsed ? category.name : undefined}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 flex-shrink-0 transition-all duration-200',
                              isCollapsed ? 'mr-0' : 'mr-3',
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          />

                          {!isCollapsed && (
                            <span className="flex-1 text-sm text-left font-medium">
                              {category.name}
                            </span>
                          )}

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-2 w-2 h-2 bg-primary rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}

                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                              {category.name}
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-foreground rotate-45" />
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
          <div className="border-t border-border/50 p-3 bg-muted/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {!isCollapsed ? (
                  <motion.div
                    variants={contentVariants}
                    className="flex items-center p-3 rounded-xl bg-background/60 hover:bg-background/80 transition-all duration-200 cursor-pointer group shadow-sm border border-border/30"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 ml-3">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        title="Online"
                      />
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex justify-center cursor-pointer group">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-56 bg-background/95 backdrop-blur-xl border-border/50"
              >
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-muted/70"
                  onClick={() => router.replace('/dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors duration-200"
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
