// src/features/sampler/types.ts
import * as Tone from "tone";
import { EngineState } from "@/core/stores/useEngineStore";
import { ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";

export interface SFZRegion extends ParseOpcodeObj {}

export interface SFZGlobal {
  defaultPath?: string;
}

export interface ParsedSFZ {
  regions: SFZRegion[];
  global: SFZGlobal;
}

export interface Sample {
  url: string;
  buffer: Tone.ToneAudioBuffer;
  dispose(): void;
}

export interface PersistableSample {
  url: string;
}

export interface Instrument {
  id: string;
  name: string;
  samples: Record<string, Sample>;
  regions: SFZRegion[];
}

export interface PersistableInstrument {
  id: string;
  name: string;
  samples: Record<string, PersistableSample>;
}

export interface SamplerState {
  samplers: Record<string, Tone.Sampler>;
  instruments: Record<string, Instrument>;
}

export interface PersistableSamplerState {
  instruments: Record<string, PersistableInstrument>;
}

export interface SamplerEngine {
  startSamplerPlayback(
    state: EngineState,
    clipId: string,
    startTime?: number,
  ): EngineState;
  loadLocalInstrument(state: SamplerState): Promise<SamplerState>;
  dispose(state: SamplerState): SamplerState;
}
