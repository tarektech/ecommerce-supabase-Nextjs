import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function profileDropDown() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
          <User className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{user ? 'Profile' : 'Sign in'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-center w-[30px]">
        <DropdownMenuItem className="cursor-pointer">
          <Link href={user ? '/profile' : '/signin'}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
            >
              <User className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{user ? 'Profile' : 'Sign in'}</span>
            </Button>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
