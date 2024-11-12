// src/common/services/InstrumentManagers.ts

import { Instrument } from "@/core/types/instrument";

export class InstrumentManager {
  private instruments = new Map<string, Instrument>();

  addInstrument(id: string, instrument: Instrument) {
    this.instruments.set(id, instrument);
  }

  getInstrument(id: string): Instrument | undefined {
    return this.instruments.get(id);
  }

  removeInstrument(id: string) {
    this.instruments.delete(id);
  }
}
