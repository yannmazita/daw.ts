// src/features/instruments/types.ts
import {
  InstrumentName,
  InstrumentOptions,
  ToneInstrumentType,
} from "@/core/types/instrument";

export interface Instrument {
  id: string;
  name: string;
  type: InstrumentName;
  node: ToneInstrumentType;
  options?: InstrumentOptions;
}

export interface PersistableInstrument {
  id: string;
  name: string;
  type: InstrumentName;
  options?: InstrumentOptions;
}

export interface InstrumentState {
  instruments: Record<string, Instrument>;
}

export interface PersistableInstrumentState {
  instruments: Record<string, PersistableInstrument>;
}

export interface InstrumentEngine {
  // Instrument operations
  createInstrument(
    type: InstrumentName,
    name?: string,
    options?: InstrumentOptions,
  ): string;
  updateInstrument(id: string, updates: Partial<Instrument>): void;
  deleteInstrument(id: string): void;

  // State
  getState(): InstrumentState;
  dispose(): void;
}
