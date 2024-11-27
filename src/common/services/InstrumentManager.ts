// src/common/services/InstrumentManager.ts

import { Instrument } from "@/core/types/instrument";
import { InstrumentName } from "@/core/enums/instrumentName";
import * as Tone from "tone";

export class InstrumentManager {
  private instruments = new Map<string, Instrument>();

  /**
   * Creates a new instrument instance based on the instrument name
   * @private
   */
  private createInstrument(instrumentName: InstrumentName): Instrument {
    let instrument: Instrument;

    switch (instrumentName) {
      case InstrumentName.AMSynth:
        instrument = new Tone.AMSynth();
        break;
      case InstrumentName.FMSynth:
        instrument = new Tone.FMSynth();
        break;
      case InstrumentName.MembraneSynth:
        instrument = new Tone.MembraneSynth();
        break;
      case InstrumentName.MetalSynth:
        instrument = new Tone.MetalSynth();
        break;
      case InstrumentName.MonoSynth:
        instrument = new Tone.MonoSynth();
        break;
      case InstrumentName.NoiseSynth:
        instrument = new Tone.NoiseSynth();
        break;
      default:
        instrument = new Tone.Synth();
    }

    return instrument.toDestination();
  }

  /**
   * Creates and adds a new instrument instance
   */
  addInstrument(id: string, instrumentName: InstrumentName) {
    // Dispose of existing instrument if it exists
    this.removeInstrument(id);

    // Create and store new instrument
    const newInstrument = this.createInstrument(instrumentName);
    this.instruments.set(id, newInstrument);
    return newInstrument;
  }

  /**
   * Retrieves an existing instrument instance
   */
  getInstrument(id: string): Instrument | undefined {
    return this.instruments.get(id);
  }

  /**
   * Removes and disposes of an instrument instance
   */
  removeInstrument(id: string) {
    const instrument = this.instruments.get(id);
    if (instrument) {
      instrument.dispose();
      this.instruments.delete(id);
    }
  }

  /**
   * Disposes of all instruments and clears the collection
   */
  dispose() {
    this.instruments.forEach((instrument) => instrument.dispose());
    this.instruments.clear();
  }

  /**
   * Returns the number of active instruments
   */
  get count(): number {
    return this.instruments.size;
  }

  /**
   * Returns all active instrument IDs
   */
  get activeInstrumentIds(): string[] {
    return Array.from(this.instruments.keys());
  }
}
