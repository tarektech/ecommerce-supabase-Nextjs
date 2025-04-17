'use client';
import { ShoppingCart, User, Moon, Sun, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import DarkTheme from './dark-theme';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/context/SidebarContext';

export function Navbar() {
  const { totalItems } = useCart();
  const { user, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-16 items-center">
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="mr-2 px-2 sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <DarkTheme />
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold">ShopClone</h1>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          <Link href={user ? '/profile' : '/signin'}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <User className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{user ? 'Profile' : 'Sign in'}</span>
            </Button>
          </Link>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
              onClick={handleSignOut}
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Sign out</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
