// src/common/store/contextMenuSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppContextMenuItem } from "../models/AppContextMenuItem";

export interface ContextMenuState {
  appLevelItems: Record<string, AppContextMenuItem>;
  contextualItems: Record<string, AppContextMenuItem[]>;
  visible: boolean;
  xPos: number;
  yPos: number;
}

const initialState: ContextMenuState = {
  appLevelItems: {},
  contextualItems: {},
  visible: false,
  xPos: 0,
  yPos: 0,
};

const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    setAppLevelItems: (state, action: PayloadAction<Record<string, AppContextMenuItem>>) => {
      state.appLevelItems = action.payload;
    },
    addContextualItems: (state, action: PayloadAction<{ groupId: string; items: AppContextMenuItem[] }>) => {
      state.contextualItems[action.payload.groupId] = action.payload.items;
    },
    clearContextualItems: (state) => {
      state.contextualItems = {};
    },
    openContextMenu: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.visible = true;
      state.xPos = action.payload.x;
      state.yPos = action.payload.y;
    },
    closeContextMenu: (state) => {
      state.visible = false;
      state.contextualItems = {};
    },
  },
});

export const {
  setAppLevelItems,
  addContextualItems,
  clearContextualItems,
  openContextMenu,
  closeContextMenu
} = contextMenuSlice.actions;

export default contextMenuSlice.reducer;
