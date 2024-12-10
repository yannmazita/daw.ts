// src/common/components/Layout.tsx

import { useThemeStore } from "@/common/slices/useThemeStore";
import { Button } from "@/common/shadcn/ui/button";
import { Moon, Sun } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/common/shadcn/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, setTheme } = useThemeStore();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen w-full bg-background dark:bg-background">
          <header className="border-b border-border dark:border-border">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-primary dark:text-primary">
                  daw.ts
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </header>
          <main className="container mx-auto p-4">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
