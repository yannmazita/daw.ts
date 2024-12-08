// src/common/slices/useStore.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import {
  TransportSlice,
  createTransportSlice,
} from "@/common/slices/useTransportSlice";
import {
  PatternSlice,
  createPatternSlice,
} from "@/features/patterns/slices/usePatternSlice";
import {
  PlaylistSlice,
  createPlaylistSlice,
} from "@/features/playlists/slices/usePlaylistSlice";
import {
  MixerSlice,
  createMixerSlice,
} from "@/features/mixer/slices/useMixerSlice";

export type StoreState = TransportSlice &
  PatternSlice &
  PlaylistSlice &
  MixerSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createTransportSlice(...a),
        ...createPatternSlice(...a),
        ...createPlaylistSlice(...a),
        ...createMixerSlice(...a),
      }),
      {
        name: "daw-storage",
        partialize: (state) => ({
          // Only persist necessary state
          patterns: state.patterns,
          mixer: {
            channels: state.channels,
            master: state.master,
          },
        }),
      },
    ),
  ),
);
