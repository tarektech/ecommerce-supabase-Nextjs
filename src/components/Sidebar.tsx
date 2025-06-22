'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/utils';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/context/AuthContext';
import { categoryService } from '@/services/category/categoryService';
import { CategoryType } from '@/types';
import { useSidebar } from '@/context/SidebarContext';
import { usePathname } from 'next/navigation';

// Default icons for each category
const categoryIcons: Record<string, React.ElementType> = {
  All: Home,
  Clothing: Shirt,
  Accessories: Watch,
  Electronics: Smartphone,
};

export function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, hideSidebar } = useSidebar();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

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
        className="fixed top-4 left-4 z-50 sm:hidden bg-background shadow-sm"
        aria-label="Toggle sidebar"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 sm:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-background border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col justify-between',
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full sm:translate-x-0',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-border cursor-pointer">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-base">
                  E
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-base">
                  E-Store
                </span>
                <span className="text-xs text-muted-foreground">
                  Premium Shop
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-sm">
              <span className="text-primary-foreground font-bold text-base">
                E
              </span>
            </div>
          )}

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden sm:flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Categories Navigation */}
        <nav className="overflow-visible px-3 py-2">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Categories
            </h3>
          )}

          {loading ? (
            <div className="animate-pulse space-y-2 px-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={cn(
                    'bg-muted rounded',
                    isCollapsed ? 'h-10 w-10' : 'h-10'
                  )}
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {displayCategories.map((category) => {
                const isActive = pathname === category.href;
                const Icon = category.icon;

                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start mb-1 group cursor-pointer',
                        isCollapsed ? 'justify-center px-2' : ''
                      )}
                      title={isCollapsed ? category.name : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isCollapsed ? 'mr-0' : 'mr-2',
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />

                      {!isCollapsed && (
                        <span className="flex-1 text-sm text-left">
                          {category.name}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {!isCollapsed ? (
                  <div className="flex items-center p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors duration-200 cursor-pointer">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 ml-2.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full ml-2"
                      title="Online"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center cursor-pointer">
                    <div className="relative">
                      <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-fit">
                <DropdownMenuItem onClick={signOut} className="cursor-pointer ">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </>
  );
}
