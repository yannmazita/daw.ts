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
import { transportManager } from "../services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { playlistManager } from "@/features/playlists/services/playlistManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";

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

// Sync middleware to handle manager subscriptions
export const createSyncMiddleware = (store: typeof useStore) => {
  const subscribeToManager = () => {
    // Subscribe to manager updates when store is created
    const unsubscribeTransport = transportManager.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    const unsubscribePattern = patternManager.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        patterns: state.patterns,
        currentPatternId: state.currentPatternId,
      }));
    });

    const unsubscribePlaylist = playlistManager.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        tracks: state.tracks,
        length: state.length,
      }));
    });

    const unsubscribeMixer = mixerManager.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        master: state.master,
        channels: state.channels,
      }));
    });

    // Return cleanup function
    return () => {
      unsubscribeTransport();
      unsubscribePattern();
      unsubscribePlaylist();
      unsubscribeMixer();
    };
  };

  // Subscribe when store is created
  const unsubscribe = subscribeToManager();

  // Clean up on store disposal
  return () => {
    unsubscribe();
  };
};

// Initialize sync middleware
createSyncMiddleware(useStore);
