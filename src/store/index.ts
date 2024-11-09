// src/store/index.ts

import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import contextMenuReducer from '../common/slices/contextMenuSlice';
import sequencerReducer from '../features/sequencer/slices/sequencerSlice';
import trackReducer from '../features/sequencer/slices/trackSlice';
import { commandMiddleware } from '../common/middleware/commandMiddleware';
import { instrumentMiddleware } from '@/common/middleware/instrumentMiddleware';

export const store = configureStore({
  reducer: {
    contextMenu: contextMenuReducer,
    track: trackReducer,
    sequencer: sequencerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(commandMiddleware).concat(instrumentMiddleware),
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
