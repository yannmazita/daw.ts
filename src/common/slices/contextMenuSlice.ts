// src/common/store/contextMenuSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from '@/store';
import { SerializableMenuItem } from "@/core/interfaces/contextMenu";

export interface ContextMenuState {
  appLevelItems: Record<string, SerializableMenuItem>;
  contextualItems: Record<string, SerializableMenuItem[]>;
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
    setAppLevelItems: (state, action: PayloadAction<Record<string, SerializableMenuItem>>) => {
      state.appLevelItems = action.payload;
    },
    addContextualItems: (state, action: PayloadAction<{ groupId: string; items: SerializableMenuItem[] }>) => {
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

export const createSelector = <T>(selector: (state: RootState) => T) => selector;

export const selectAppLevelItems = createSelector((state: RootState) => state.contextMenu.appLevelItems);
export const selectContextualItems = createSelector((state: RootState) => state.contextMenu.contextualItems);
export const selectContextMenuVisibility = createSelector((state: RootState) => state.contextMenu.visible);
export const selectContextMenuPosition = createSelector((state: RootState) => ({
  xPos: state.contextMenu.xPos,
  yPos: state.contextMenu.yPos,
}));
