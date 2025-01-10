// src/common/stores/useUIStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";

type Theme = "dark" | "light";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  clickedComponentId: string | null;
  setClickedComponentId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
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
        clickedComponentId: null,
        setClickedComponentId: (id) => set({ clickedComponentId: id }),
      }),
      {
        name: "daw-ui-storage",
      },
    ),
  ),
);

// Initialize theme on app load
if (typeof window !== "undefined") {
  const theme = useUIStore.getState().theme;
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}
