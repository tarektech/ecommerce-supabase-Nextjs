import { useState, useEffect } from 'react';
import { Home, Shirt, Watch, Smartphone } from 'lucide-react';
import { cn } from '@/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { categoryService } from '@/services/categoryService';
import { CategoryType } from '@/types';

// Default icons for each category
const categoryIcons: Record<string, React.ElementType> = {
  All: Home,
  Clothing: Shirt,
  Accessories: Watch,
  Electronics: Smartphone,
};

export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchCategories();
  }, []);

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
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out',
          'sm:translate-x-0 sm:static',
          !isMobileMenuOpen && '-translate-x-full'
        )}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-foreground">Categories</h2>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          ) : (
            <ul>
              {displayCategories.map((category) => {
                const isActive = location.pathname === category.href;
                return (
                  <li key={category.name} className="mb-2">
                    <Link
                      to={category.href}
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
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
