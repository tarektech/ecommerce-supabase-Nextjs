'use client';

import { useState, useEffect } from 'react';
import { Home, Shirt, Watch, Smartphone } from 'lucide-react';
import { cn } from '@/utils';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { categoryService } from '@/services/categoryService';
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
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
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

  if (!mounted) {
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

  return (
    <>
      <aside
        className={cn(
          'h-[calc(100vh-4rem)] w-64 bg-background border-r border-border',
          'fixed left-0 top-16 z-30',
          'transition-transform duration-300 ease-in-out',
          'sm:relative sm:top-0 sm:translate-x-0',
          !isMobileMenuOpen && '-translate-x-full sm:translate-x-0'
        )}
      >
        <nav className="h-full overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Categories
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {displayCategories.map((category) => {
                  const isActive = pathname === category.href;
                  return (
                    <li key={category.name}>
                      <Link
                        href={category.href}
                        className={cn(
                          'flex items-center p-2 rounded-md',
                          'transition-colors duration-200',
                          isActive
                            ? 'text-foreground font-medium bg-muted'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <category.icon className="mr-2" size={20} />
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
