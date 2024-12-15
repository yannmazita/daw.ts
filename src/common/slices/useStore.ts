// src/common/slices/useStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { TransportState } from "@/features/transport/types";
import { PersistableClipState } from "@/features/clips/types";
import { PersistableArrangementState } from "@/features/arrangement/types";
import { PersistableAutomationState } from "@/features/automation/types";
import { PersistableMixState } from "@/features/mix/types";

interface RootState {
  transport: TransportState;
  clips: PersistableClipState;
  mix: PersistableMixState;
  automation: PersistableAutomationState;
  arrangement: PersistableArrangementState;
}

export const useStore = create<RootState>()(
  devtools(
    persist(
      (...a) => ({
        ...createTransportSlice(...a),
        ...createClipsSlice(...a),
        ...createMixSlice(...a),
        ...createAutomationSlice(...a),
        ...createArrangementSlice(...a),
      }),
      {
        name: "daw-storage",
        partialize: (state) => ({
          // Only persist non-runtime state
          transport: state.transport,
          clips: state.clips,
          mix: state.mix,
          automation: state.automation,
          arrangement: state.arrangement,
        }),
      },
    ),
  ),
);

// Sync middleware to handle engine subscriptions
export const createSyncMiddleware = (store: typeof useStore) => {
  const subscribeToManager = () => {
    // Subscribe to engine updates when store is created
    const unsubscribeTransport = transportEngine.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    const unsubscribeClips = clipEngine.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    const unsubscribeMix = mixEngine.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    const unsubscribeAutomation = automationEngine.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    const unsubscribeArrangement = arrangementEngine.onStateUpdate((state) => {
      store.setState((prev) => ({
        ...prev,
        ...state,
      }));
    });

    // Return cleanup function
    return () => {
      unsubscribeTransport();
      unsubscribeClips();
      unsubscribeMix();
      unsubscribeAutomation();
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
