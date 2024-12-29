// src/common/store/engineStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { TransportState } from "@/features/transport/types";
import { ClipState, PersistableClipState } from "@/features/clips/types";
import { MixState, PersistableMixState } from "@/features/mix/types";
import {
  AutomationState,
  PersistableAutomationState,
} from "@/features/automation/types";
import {
  ArrangementState,
  PersistableArrangementState,
} from "@/features/arrangement/types";
import { initialTransportState } from "@/features/transport/utils/initialState";
import { initialClipState } from "@/features/clips/utils/initialState";
import { initialMixState } from "@/features/mix/utils/initialState";
import { initialAutomationState } from "@/features/automation/utils/initialState";
import { initialArrangementState } from "@/features/arrangement/utils/initialState";

export interface EngineState {
  transport: TransportState;
  clips: ClipState;
  mix: MixState;
  automation: AutomationState;
  arrangement: ArrangementState;
}

// Type for persisted state
interface PersistableEngineState {
  transport: TransportState;
  clips: PersistableClipState;
  mix: PersistableMixState;
  automation: PersistableAutomationState;
  arrangement: PersistableArrangementState;
}

export const useEngineStore = create<EngineState>()(
  devtools(
    persist(
      (set) => ({
        transport: initialTransportState,
        clips: initialClipState,
        mix: initialMixState,
        automation: initialAutomationState,
        arrangement: initialArrangementState,
      }),
      {
        name: "daw-engine-storage",
        // Use the persistable types for storage
        partialize: (state): PersistableEngineState => ({
          transport: state.transport,
          clips: {
            ...state.clips,
            contents: Object.fromEntries(
              Object.entries(state.clips.contents).map(([id, content]) => [
                id,
                { ...content, buffer: null },
              ]),
            ),
            activeClips: Object.fromEntries(
              Object.entries(state.clips.activeClips).map(([id, clip]) => [
                id,
                { clip: clip.clip },
              ]),
            ),
          },
          mix: {
            ...state.mix,
            mixerTracks: Object.fromEntries(
              Object.entries(state.mix.mixerTracks).map(([id, mixerTrack]) => [
                id,
                {
                  id: mixerTrack.id,
                  name: mixerTrack.name,
                  type: mixerTrack.type,
                },
              ]),
            ),
            devices: Object.fromEntries(
              Object.entries(state.mix.devices).map(([id, device]) => [
                id,
                {
                  id: device.id,
                  type: device.type,
                  name: device.name,
                  bypass: device.bypass,
                  options: device.options,
                },
              ]),
            ),
            sends: state.mix.sends,
            trackSends: state.mix.trackSends,
          },
          automation: {
            ...state.automation,
            lanes: state.automation.lanes,
            activeAutomation: Object.fromEntries(
              Object.entries(state.automation.activeAutomation).map(
                ([id, auto]) => [id, { points: auto.points }],
              ),
            ),
          },
          arrangement: {
            ...state.arrangement,
            tracks: Object.fromEntries(
              Object.entries(state.arrangement.tracks).map(([id, track]) => [
                id,
                {
                  id: track.id,
                  name: track.name,
                  index: track.index,
                  clipIds: track.clipIds,
                  automationIds: track.automationIds,
                  type: track.type,
                },
              ]),
            ),
          },
        }),
        merge: (
          persistedState: unknown,
          currentState: EngineState,
        ): EngineState => {
          // Type guard to ensure persisted state matches our expected structure
          const isPersistableEngineState = (
            state: unknown,
          ): state is PersistableEngineState => {
            const s = state as PersistableEngineState;
            return (
              s !== null &&
              typeof s === "object" &&
              "transport" in s &&
              "clips" in s &&
              "mix" in s &&
              "automation" in s &&
              "arrangement" in s
            );
          };

          // If persisted state doesn't match our type, return current state
          if (!isPersistableEngineState(persistedState)) {
            console.warn(
              "Invalid persisted state structure, using initial state",
            );
            return currentState;
          }

          // Now TypeScript knows persistedState is PersistableEngineState
          // Most getting empty state for now
          return {
            ...currentState,
            transport: persistedState.transport,
            clips: {
              ...currentState.clips,
              ...persistedState.clips,
              activeClips: {}, // Reset active clips
            },
            mix: {
              ...currentState.mix, // Start with current state to get proper types
              mixerTracks: {}, // Empty to force reinitialization
              meterData: {}, // Reset meter data
              devices: {}, // Empty to force device reinitialization
              sends: persistedState.mix.sends,
              trackSends: persistedState.mix.trackSends,
            },
            automation: {
              ...currentState.automation,
              lanes: persistedState.automation.lanes,
              activeAutomation: {}, // Reset active automation
            },
            arrangement: {
              ...currentState.arrangement, // Start with current state to get proper types
              tracks: {}, // Empty to force track reinitialization
              trackOrder: [], // Reset track order
            },
          };
        },
      },
    ),
  ),
);

// Selectors
export const useTransportState = () =>
  useEngineStore((state) => state.transport);

export const useClipsState = () => useEngineStore((state) => state.clips);

export const useMixState = () => useEngineStore((state) => state.mix);

export const useAutomationState = () =>
  useEngineStore((state) => state.automation);

export const useArrangementState = () =>
  useEngineStore((state) => state.arrangement);
