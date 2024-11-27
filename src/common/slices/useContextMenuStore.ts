// src/common/slices/useContextMenuStore.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { ContextMenuState } from "@/core/interfaces/contextMenu";

export const useContextMenuStore = create<ContextMenuState>()(
  devtools(
    persist(
      (set) => ({
        appLevelItems: {},
        contextualItems: {},
        visible: false,
        xPos: 0,
        yPos: 0,
        setAppLevelItems: (items) => set({ appLevelItems: items }),
        addContextualItems: (groupId, items) =>
          set((state) => ({
            contextualItems: { ...state.contextualItems, [groupId]: items },
          })),
        clearContextualItems: () => set({ contextualItems: {} }),
        openContextMenu: (x, y) => set({ visible: true, xPos: x, yPos: y }),
        closeContextMenu: () => set({ visible: false, contextualItems: {} }),
      }),
      { name: "contextMenu-storage" },
    ),
  ),
);
