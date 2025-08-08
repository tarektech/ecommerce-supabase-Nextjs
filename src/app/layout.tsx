import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import Sidebar  from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TanStackQueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "sonner";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "E-Commerce App",
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
      <body className="bg-background min-h-screen">
        <ErrorBoundary>
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
                    <Sidebar />
                    <SidebarInset>
                      <DemoBanner />
                      <Navbar />
                      <MainLayout>{children}</MainLayout>
                    </SidebarInset>
                  </SidebarProvider>
                </ThemeProvider>
              </CartProvider>
            </AuthProvider>
          </TanStackQueryProvider>
        </ErrorBoundary>
        <Toaster
          theme="light" // or "dark" or "system"
          toastOptions={{
            unstyled: false,
            classNames: {
              error: "bg-red-500 text-white border-red-600",
              success: "bg-green-500 text-white border-green-600",
              warning: "bg-yellow-500 text-black border-yellow-600",
              info: "bg-blue-500 text-white border-blue-600",
            },
          }}
        />
        
      </body>
    </html>
  );
}
