// src/core/stores/useEngineStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { TransportState } from "@/features/transport/types";
import {
  SamplerState,
  PersistableSamplerState,
} from "@/features/sampler/types";
import { ClipState, PersistableClipState } from "@/features/clips/types";
import { MixState, PersistableMixState } from "@/features/mix/types";
import {
  AutomationState,
  PersistableAutomationState,
} from "@/features/automation/types";
import { PersistableTrackState, TrackState } from "@/features/tracks/types";
import {
  CompositionState,
  PersistableCompositionState,
} from "@/features/composition/types";
import { initialTransportState } from "@/features/transport/utils/initialState";
import { initialSamplerState } from "@/features/sampler/utils/initialState";
import { initialClipState } from "@/features/clips/utils/initialState";
import { initialMixState } from "@/features/mix/utils/initialState";
import { initialAutomationState } from "@/features/automation/utils/initialState";
import { initialCompositionState } from "@/features/composition/utils/initialState";
import { initialTrackState } from "@/features/tracks/utils/initialState";

export interface EngineState {
  transport: TransportState;
  sampler: SamplerState;
  clips: ClipState;
  mix: MixState;
  automation: AutomationState;
  tracks: TrackState;
  composition: CompositionState;
}

// Type for persisted state
interface PersistableEngineState {
  transport: TransportState;
  sampler: PersistableSamplerState;
  clips: PersistableClipState;
  mix: PersistableMixState;
  automation: PersistableAutomationState;
  tracks: PersistableTrackState;
  composition: PersistableCompositionState;
}

export const useEngineStore = create<EngineState>()(
  devtools(
    persist(
      (set) => ({
        transport: initialTransportState,
        sampler: initialSamplerState,
        clips: initialClipState,
        mix: initialMixState,
        automation: initialAutomationState,
        tracks: initialTrackState,
        composition: initialCompositionState,
      }),
      {
        name: "daw-engine-storage",
        partialize: (state): PersistableEngineState => ({
          transport: state.transport,
          sampler: {
            ...state.sampler,
            instruments: Object.fromEntries(
              Object.entries(state.sampler.instruments).map(
                ([id, instrument]) => [
                  id,
                  {
                    id: instrument.id,
                    name: instrument.name,
                    samples: Object.fromEntries(
                      Object.entries(instrument.samples).map(
                        ([sampleId, sample]) => [sampleId, { url: sample.url }],
                      ),
                    ),
                    regions: instrument.regions,
                    node: null,
                  },
                ],
              ),
            ),
          },
          clips: {
            ...state.clips,
            clips: Object.fromEntries(
              Object.entries(state.clips.clips).map(([id, clip]) => [
                id,
                {
                  id: clip.id,
                  parentId: clip.parentId,
                  name: clip.name,
                  type: clip.type,
                  startTime: clip.startTime,
                  pausedAt: clip.pausedAt,
                  duration: clip.duration,
                  fadeIn: clip.fadeIn,
                  fadeOut: clip.fadeOut,
                  playerStartTime: clip.playerStartTime,
                  instrumentId: clip.instrumentId,
                },
              ]),
            ),
          },
          mix: {
            mixerTracks: Object.fromEntries(
              Object.entries(state.mix.mixerTracks).map(([id, track]) => [
                id,
                {
                  id: track.id,
                  name: track.name,
                  type: track.type,
                  deviceIds: track.deviceIds,
                  controls: {
                    solo: track.controls.solo,
                    mute: track.controls.mute,
                    pan: track.controls.pan,
                    volume: track.controls.volume,
                  },
                },
              ]),
            ),
            mixerTrackOrder: state.mix.mixerTrackOrder,
            devices: Object.fromEntries(
              Object.entries(state.mix.devices)
                .filter(([_, device]) => !device.node) // Exclude devices with runtime nodes
                .map(([id, device]) => [
                  id,
                  {
                    id: device.id,
                    type: device.type,
                    name: device.name,
                    bypass: device.bypass,
                    options: device.options,
                    parentId: device.parentId,
                  },
                ]),
            ),
            soundChains: Object.fromEntries(
              Object.entries(state.mix.soundChains).map(([id, chain]) => [
                id,
                {
                  id: chain.id,
                  name: chain.name,
                  deviceIds: chain.deviceIds,
                  inputGainValue: chain.input?.gain?.value ?? 1,
                  outputGainValue: chain.output?.gain?.value ?? 1,
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
                  gainValue: send.gain?.gain?.value ?? 1,
                },
              ]),
            ),
            trackSends: state.mix.trackSends,
          },
          automation: {
            lanes: state.automation.lanes,
            activeAutomation: Object.fromEntries(
              Object.entries(state.automation.activeAutomation).map(
                ([id, auto]) => [id, { points: auto.points }],
              ),
            ),
          },
          tracks: {
            tracks: Object.fromEntries(
              Object.entries(state.tracks.tracks).map(([id, track]) => [
                id,
                {
                  id: track.id,
                  name: track.name,
                  type: track.type,
                  controls: track.controls,
                },
              ]),
            ),
            trackOrder: state.tracks.trackOrder,
          },
          composition: state.composition,
        }),
        merge: (
          persistedState: unknown,
          currentState: EngineState,
        ): EngineState => {
          console.warn(
            "Persisted state loading is deactivated, using initial state",
          );
          return currentState;
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
export const useCompositionState = () =>
  useEngineStore((state) => state.composition);
