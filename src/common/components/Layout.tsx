// src/common/components/Layout.tsx
import { useUIStore } from "@/core/stores/useUIStore";
import { Button } from "@/common/shadcn/ui/button";
import { Moon, Sun } from "lucide-react";
import { PlaybackControls } from "@/features/transport/components/PlaybackControls/PlaybackControls";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">daw.ts</h1>
          <PlaybackControls />
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
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
};
