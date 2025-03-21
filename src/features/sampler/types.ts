// src/features/sampler/types.ts
import { EngineState } from "@/core/stores/useEngineStore";
import { SamplerInstrumentService } from "./services/SamplerInstrumentService";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

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
  sample?: string; // File path of the sample
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
  lochan?: number;
  hichan?: number;
  lovel?: number;
  hivel?: number;
  lobend?: number;
  hibend?: number;
  lochanaft?: number;
  hichanaft?: number;
  lopolyaft?: number;
  hipolyaft?: number;
  lorand?: number;
  hirand?: number;
  lobpm?: number;
  hibpm?: number;
}

export interface Sampler {
  id: string;
  name: string;
  trackId: string;
  chainId?: string;
  instrument: SamplerInstrumentService;
}

export interface SfzFileStatus {
  id: string;
  path: string;
  lastLoaded: number | null;
  loaded: boolean;
  error: string | null;
}

export interface SamplerState {
  samplers: Record<string, Sampler>;
  sfzFilesFound: Record<string, SfzFileStatus>;
  sfzFilesFoundOrder: string[];
}

export interface SamplerEngine {
  createSamplerInstrumentForTrack(
    state: EngineState,
    trackId: string,
    name?: string,
  ): EngineState;
  createSamplerInstrumentForChain(
    state: EngineState,
    trackId: string,
    chainId: string,
    name?: string,
  ): EngineState;

  loadDirectory(
    state: SamplerState,
    blobs: FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[],
  ): SamplerState;

  dispose(state: SamplerState): Promise<SamplerState>;
}
