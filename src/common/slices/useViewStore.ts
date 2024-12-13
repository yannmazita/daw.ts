// src/common/slices/useViewStore.ts
import { create } from "zustand";
import { ViewType } from "@/core/types/common";

interface ViewState {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  currentView: ViewType.ARRANGEMENT,
  setView: (view) => set({ currentView: view }),
}));
