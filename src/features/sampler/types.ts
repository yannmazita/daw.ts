// src/features/sampler/types.ts
import * as Tone from "tone";
import { EngineState } from "@/core/stores/useEngineStore";

export interface SFZRegion {
  sample: string;
  loKey: number;
  hiKey: number;
  loVel: number;
  hiVel: number;
  pitchKeycenter: number;
  loopMode: string;
  loopStart: number;
  loopEnd: number;
}

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
  regions: SFZRegion[];
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

  loadInstrument(
    state: SamplerState,
    instrumentId: string,
    sfzFile: File,
  ): Promise<SamplerState>;
  createSampler(state: SamplerState, instrumentId: string): SamplerState;
  dispose(state: SamplerState): SamplerState;
}
