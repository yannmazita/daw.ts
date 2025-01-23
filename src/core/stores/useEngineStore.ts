// src/core/stores/useEngineStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TransportState } from "@/features/transport/types";
import { SamplerState } from "@/features/sampler/types";
import { ClipState } from "@/features/clips/types";
import { MixState } from "@/features/mix/types";
import { AutomationState } from "@/features/automation/types";
import { CompositionState } from "@/features/composition/types";
import { initialTransportState } from "@/features/transport/utils/initialState";
import { initialSamplerState } from "@/features/sampler/utils/initialState";
import { initialClipState } from "@/features/clips/utils/initialState";
import { initialMixState } from "@/features/mix/utils/initialState";
import { initialAutomationState } from "@/features/automation/utils/initialState";
import { initialCompositionState } from "@/features/composition/utils/initialState";

export interface EngineState {
  transport: TransportState;
  sampler: SamplerState;
  clips: ClipState;
  mix: MixState;
  automation: AutomationState;
  composition: CompositionState;
}

export const useEngineStore = create<EngineState>()(
  devtools((set) => ({
    transport: initialTransportState,
    sampler: initialSamplerState,
    clips: initialClipState,
    mix: initialMixState,
    automation: initialAutomationState,
    composition: initialCompositionState,
  })),
);

// Selectors
export const useTransportState = () =>
  useEngineStore((state) => state.transport);
export const useSamplerState = () => useEngineStore((state) => state.sampler);
export const useClipsState = () => useEngineStore((state) => state.clips);
export const useMixState = () => useEngineStore((state) => state.mix);
export const useAutomationState = () =>
  useEngineStore((state) => state.automation);
export const useCompositionState = () =>
  useEngineStore((state) => state.composition);
