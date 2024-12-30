// src/common/components/Layout.tsx
import { useThemeStore } from "@/core/stores/useThemeStore";
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
        <div className="flex h-screen w-full flex-col bg-background">
          <header className="flex h-14 items-center justify-between border-b border-border px-4">
            <h1 className="text-xl font-bold text-primary">daw.ts</h1>
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
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
