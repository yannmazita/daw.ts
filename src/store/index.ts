// src/store/index.ts

import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import contextMenuReducer from '../common/slices/contextMenuSlice';
import sequencerReducer from '../features/sequencer/slices/sequencerSlice';
import { commandMiddleware } from '../common/middleware/commandMiddleware';

export const store = configureStore({
  reducer: {
    contextMenu: contextMenuReducer,
    sequencer: sequencerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(commandMiddleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
