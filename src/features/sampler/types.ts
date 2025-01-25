// src/features/sampler/types.ts
import { FileLoaderService } from "./services/FileLoaderService";

export interface Instrument {
  id: string;
  name: string;
  type: string;
  data: any;
  outputNode: AudioNode;
}

export interface SamplerState {
  instruments: Record<string, Instrument>;
}

export interface SamplerEngine {
  loadLocalInstrument(): Promise<void>;
  getFileLoader(): FileLoaderService;

  dispose(state: SamplerState): Promise<SamplerState>;
}

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
