'use client';

import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed, hideSidebar } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        hideSidebar ? '' : isCollapsed ? 'sm:ml-20' : 'sm:ml-72'
      )}
    >
      {children}
    </main>
  );
}
