// src/common/stores/useThemeStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: "dark",
        setTheme: (theme) => {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(theme);
          set({ theme });
        },
      }),
      {
        name: "daw-theme-storage",
      },
    ),
  ),
);

// Initialize theme on app load
if (typeof window !== "undefined") {
  const theme = useThemeStore.getState().theme;
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}
