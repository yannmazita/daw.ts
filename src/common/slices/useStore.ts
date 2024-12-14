// src/common/slices/useStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import {
  TransportSlice,
  createTransportSlice,
} from "@/common/slices/useTransportSlice";
import {
  MixerSlice,
  createMixerSlice,
} from "@/features/mixer/slices/useMixerSlice";
import {
  SessionSlice,
  createSessionSlice,
} from "@/features/session/slices/useSessionSlice";
import {
  ArrangementSlice,
  createArrangementSlice,
} from "@/features/arrangement/slices/useArrangementSlice";
import { transportManager } from "../services/transportManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { sessionManager } from "@/features/session/services/SessionManagerInstance";
import { arrangementCoordinator } from "@/features/arrangement/services/arrangementCoordinatorInstance";

export type StoreState = TransportSlice &
  MixerSlice &
  SessionSlice &
  ArrangementSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createTransportSlice(...a),
        ...createMixerSlice(...a),
        ...createSessionSlice(...a),
        ...createArrangementSlice(...a),
      }),
      {
        name: "daw-storage",
        partialize: (state) => ({
          // Mixer state
          mixer: {
            channels: state.channels,
            master: state.master,
          },

          // Scene state
          scenes: state.scenes,
          currentSceneId: state.currentSceneId,
          globalQuantization: state.globalQuantization,
          clipQuantization: state.clipQuantization,

          // Arrangement state
          viewportStartTime: state.viewportStartTime,
          viewportEndTime: state.viewportEndTime,
          viewportVerticalOffset: state.viewportVerticalOffset,
          zoom: state.zoom,
          tracks: state.tracks,
          patterns: state.patterns,
          markers: state.markers,
          regions: state.regions,
          automationLanes: state.automationLanes,
          selectedItems: state.selectedItems,
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

    const unsubscribeArrangement = arrangementCoordinator.onStateUpdate(
      (state) => {
        store.setState((prev) => ({
          ...prev,
          viewportStartTime: state.viewportStartTime,
          viewportEndTime: state.viewportEndTime,
          viewportVerticalOffset: state.viewportVerticalOffset,
          zoom: state.zoom,
          tracks: state.tracks,
          patterns: state.patterns,
          markers: state.markers,
          regions: state.regions,
          automationLanes: state.automationLanes,
          selectedItems: state.selectedItems,
        }));
      },
    );

    // Return cleanup function
    return () => {
      unsubscribeTransport();
      unsubscribeMixer();
      unsubscribeSession();
      unsubscribeArrangement();
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
