// src/features/sampler/types.ts
export interface RegionDefaults {
  lochan: number;
  hichan: number;
  lokey: number;
  hikey: number;
  lovel: number;
  hivel: number;
  lobend: number;
  hibend: number;
  lochanaft: number;
  hichanaft: number;
  lopolyaft: number;
  hipolyaft: number;
  lorand: number;
  hirand: number;
  lobpm: number;
  hibpm: number;
}

// Core types for SFZ player
export interface SfzOptions {
  preload?: PreloadMode;
  root?: string;
}

export enum PreloadMode {
  ON_DEMAND = "on-demand",
  SEQUENTIAL = "sequential",
}

export interface SfzControlEvent {
  channel: number;
  note: number;
  velocity: number;
}

export interface SfzRegion {
  sample?: string;
  lokey?: number;
  hikey?: number;
  pitch_keycenter?: number;
  pitch_keytrack?: number;
  tune?: number;
  transpose?: number;
  volume?: number;
  pan?: number;
  offset?: number;
  end?: number;
  loop_mode?: string;
  loop_start?: number;
  loop_end?: number;
}

export interface AudioFile {
  buffer: AudioBuffer | null;
  path: string;
}

export interface SamplerState {}

export interface SamplerEngine {
  getOutputNode(): GainNode;
  dispose(state: SamplerState): Promise<SamplerState>;
}
