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

  updateTransport: (updates: Partial<TransportState>) => void;
  updateClips: (updates: Partial<ClipState>) => void;
  updateMix: (updates: Partial<MixState>) => void;
  updateAutomation: (updates: Partial<AutomationState>) => void;
  updateArrangement: (updates: Partial<ArrangementState>) => void;
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

        updateTransport: (updates) =>
          set((state) => ({
            transport: { ...state.transport, ...updates },
          })),
        updateClips: (updates) =>
          set((state) => ({
            clips: { ...state.clips, ...updates },
          })),
        updateMix: (updates) =>
          set((state) => ({
            mix: { ...state.mix, ...updates },
          })),
        updateAutomation: (updates) =>
          set((state) => ({
            automation: { ...state.automation, ...updates },
          })),
        updateArrangement: (updates) =>
          set((state) => ({
            arrangement: { ...state.arrangement, ...updates },
          })),
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
                { ...content, buffer: undefined },
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
            channels: Object.fromEntries(
              Object.entries(state.mix.channels).map(([id, channel]) => [
                id,
                {
                  id: channel.id,
                  name: channel.name,
                  type: channel.type,
                  output: channel.output,
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
          },
        }),
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
