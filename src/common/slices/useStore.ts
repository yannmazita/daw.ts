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
import {
  SessionSlice,
  createSessionSlice,
} from "@/features/session/slices/useSessionSlice";
import { transportManager } from "../services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { playlistManager } from "@/features/playlists/services/playlistManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { sessionManager } from "@/features/session/services/SessionManagerInstance";

export type StoreState = TransportSlice &
  PatternSlice &
  PlaylistSlice &
  MixerSlice &
  SessionSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createTransportSlice(...a),
        ...createPatternSlice(...a),
        ...createPlaylistSlice(...a),
        ...createMixerSlice(...a),
        ...createSessionSlice(...a),
      }),
      {
        name: "daw-storage",
        partialize: (state) => ({
          // Pattern state
          patterns: state.patterns,
          currentPatternId: state.currentPatternId,

          // Mixer state
          mixer: {
            channels: state.channels,
            master: state.master,
          },

          // Playlist state
          tracks: state.tracks,
          length: state.length,

          // Scene state
          scenes: state.scenes,
          currentSceneId: state.currentSceneId,
          globalQuantization: state.globalQuantization,
          clipQuantization: state.clipQuantization,
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
        tracks: state.tracks, // Updated to match new interface
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

    const unsubscribeSession = sessionManager.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        scenes: state.scenes,
        currentSceneId: state.currentSceneId,
        globalQuantization: state.globalQuantization,
        clipQuantization: state.clipQuantization,
      }));
    });

    // Return cleanup function
    return () => {
      unsubscribeTransport();
      unsubscribePattern();
      unsubscribePlaylist();
      unsubscribeMixer();
      unsubscribeSession();
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
