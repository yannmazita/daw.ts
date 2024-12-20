// src/common/slices/useViewStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { ViewType } from "@/core/types/common";

interface ViewState {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const useViewStore = create<ViewState>()(
  devtools((set) => ({
    currentView: ViewType.NOTHING,
    setView: (view) => set({ currentView: view }),
  })),
);
