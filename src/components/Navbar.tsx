import { ShoppingCart, User, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Navbar({
  theme,
  toggleTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const { totalItems } = useCart();
  const { user, loading, signOut } = useAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Force a component re-render for testing
  const forceRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
    console.log('Forced refresh, auth state:', {
      user,
      isAuthenticated: !!user,
      loading,
      refreshCounter: refreshCounter + 1,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully, user state:', {
        user,
        isAuthenticated: !!user,
      });
      // Force a refresh after signout
      forceRefresh();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // const authStatus = user ? 'Signed In' : 'Signed Out';

  return (
    <nav className="bg-background shadow-md p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold">ShopClone</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
          <Link to="/cart">
            <Button className="hover:bg-accent hover:text-accent-foreground relative cursor-pointer">
              <ShoppingCart className="mr-2" size={20} />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link to={user ? '/profile' : '/sign-in'}>
            <Button className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <User className="mr-2" size={20} />
              {user ? 'Profile' : 'Sign In'}
            </Button>
          </Link>
          {user && (
            <Button
              variant="destructive"
              className="hover:bg-red-600 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2" size={20} />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
