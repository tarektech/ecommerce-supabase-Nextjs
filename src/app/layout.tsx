import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';
import { TanStackQueryProvider } from '@/lib/providers/query-provider';
import StagewiseToolbar from '@/StagewiseToolbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'E-Commerce',
  description: 'E-Commerce App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <title>My App</title>
        <meta name="description" content="My App is a..." />
      </head>
      <body className="min-h-screen bg-background">
        <TanStackQueryProvider>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarProvider>
                  <Navbar />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 sm:ml-72">{children}</main>
                  </div>
                </SidebarProvider>
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </TanStackQueryProvider>
        <Toaster
          theme="light" // or "dark" or "system"
          toastOptions={{
            unstyled: false,
            classNames: {
              error: 'bg-red-500 text-white border-red-600',
              success: 'bg-green-500 text-white border-green-600',
              warning: 'bg-yellow-500 text-black border-yellow-600',
              info: 'bg-blue-500 text-white border-blue-600',
            },
          }}
        />
        <StagewiseToolbar />
      </body>
    </html>
  );
}
