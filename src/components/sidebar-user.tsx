"use client";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { SidebarFooter, SidebarMenuButton, useSidebar } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ChevronRight, LayoutDashboard, LogOut, Settings, ShoppingCart, User } from "lucide-react";
import { Motion } from "./motion/motion";
import { contentVariants } from "./motion/animation-variants";
import { useRouter } from "next/navigation";



export default function SidebarUser() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();

  return (
    <>
     {/* User section */}
     {user && (
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {!isCollapsed ? (
                <Motion
                  variants={contentVariants}
                  initial={isCollapsed ? "closed" : "open"}
                  animate={isCollapsed ? "closed" : "open"}
                  className="bg-background/60 hover:bg-background/80 group border-border/30 flex cursor-pointer items-center rounded-xl border p-3 shadow-sm transition-all duration-200"
                >
                  <Avatar className="ring-primary/20 h-9 w-9 ring-2">
                    <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {user.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-2 w-2 rounded-full bg-green-500"
                      title="Online"
                    />
                    <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors duration-200" />
                  </div>
                </Motion>
              ) : (
                <SidebarMenuButton
                  size="lg"
                  className="group cursor-pointer"
                  tooltip={`${user.email?.split("@")[0] || "User"}`}
                >
                  <div className="relative">
                    <Avatar className="ring-primary/20 group-hover:ring-primary/40 h-8 w-8 ring-2 transition-all duration-200">
                      <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                  </div>
                </SidebarMenuButton>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              sideOffset={8}
              className="bg-background/95 border-border/50 z-[80] w-56 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="focus:bg-muted/70 cursor-pointer"
                onClick={() => router.replace("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-muted/70 cursor-pointer"
                onClick={() => router.replace("/cart")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Cart</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-muted/70 cursor-pointer"
                onClick={() => router.replace("/dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  className="focus:bg-muted/70 cursor-pointer"
                  onClick={() => router.replace("/admin")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={signOut}
                className="focus:bg-muted/70 cursor-pointer transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </>
  );
}