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
                  controls: {
                    solo: mixerTrack.controls.solo,
                    mute: mixerTrack.controls.mute,
                    pan: mixerTrack.controls.pan,
                    volume: mixerTrack.controls.volume,
                  },
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
            sends: Object.fromEntries(
              Object.entries(state.mix.sends).map(([id, send]) => [
                id,
                {
                  id: send.id,
                  name: send.name,
                  sourceTrackId: send.sourceTrackId,
                  returnTrackId: send.returnTrackId,
                  preFader: send.preFader,
                  gainValue: send.gain.gain.value,
                },
              ]),
            ),
            trackSends: state.mix.trackSends,
            mixerTrackOrder: state.mix.mixerTrackOrder,
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
                  controls: track.controls,
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
          console.warn(
            "Persisted state loading is deactivated, using initial state",
          );
          return currentState; // Always return the initial state
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
