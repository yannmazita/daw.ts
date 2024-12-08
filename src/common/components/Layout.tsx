// src/common/components/Layout.tsx

import { useThemeStore } from "@/common/slices/useThemeStore";
import { Button } from "@/common/shadcn/ui/button";
import { Moon, Sun } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
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
  );
}
