// src/common/services/InstrumentManager.ts

import { Instrument } from "@/core/types/instrument";
import { InstrumentName } from "@/core/enums/instrumentName";
import { audioGraphManager } from "@/features/mixer/services/audioGraphManagerInstance";
import * as Tone from "tone";

interface InstrumentConnection {
  instrument: Instrument;
  channelId: string;
}

export class InstrumentManager {
  private instruments = new Map<string, InstrumentConnection>();

  /**
   * Creates a new instrument instance based on the instrument name
   * @private
   */
  private createInstrument(
    instrumentName: InstrumentName,
    channelId: string,
  ): InstrumentConnection {
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

    // Get the mixer channel
    const channel = audioGraphManager.getChannel(channelId);
    if (!channel) {
      throw new Error(`Mixer channel ${channelId} not found`);
    }

    // Connect instrument to mixer channel
    instrument.connect(channel);

    return { instrument, channelId };
  }

  /**
   * Creates and adds a new instrument instance
   */
  addInstrument(
    id: string,
    instrumentName: InstrumentName,
    channelId: string,
  ): Instrument {
    // Dispose of existing instrument if it exists
    this.removeInstrument(id);

    // Create and store new instrument
    const connection = this.createInstrument(instrumentName, channelId);
    this.instruments.set(id, connection);
    return connection.instrument;
  }

  /**
   * Retrieves an existing instrument instance
   */
  getInstrument(id: string): Instrument | undefined {
    return this.instruments.get(id)?.instrument;
  }

  /**
   * Gets the channel ID associated with an instrument
   */
  getInstrumentChannel(id: string): string | undefined {
    return this.instruments.get(id)?.channelId;
  }

  /**
   * Reassigns an instrument to a different mixer channel
   */
  reassignChannel(instrumentId: string, newChannelId: string): void {
    const connection = this.instruments.get(instrumentId);
    if (!connection) return;

    const { instrument } = connection;

    // Disconnect from current channel
    instrument.disconnect();

    // Connect to new channel
    const newChannel = audioGraphManager.getChannel(newChannelId);
    if (!newChannel) {
      throw new Error(`Mixer channel ${newChannelId} not found`);
    }

    instrument.connect(newChannel);
    connection.channelId = newChannelId;
  }

  /**
   * Removes and disposes of an instrument instance
   */
  removeInstrument(id: string) {
    const connection = this.instruments.get(id);
    if (connection) {
      connection.instrument.disconnect();
      connection.instrument.dispose();
      this.instruments.delete(id);
    }
  }

  /**
   * Disposes of all instruments and clears the collection
   */
  dispose() {
    this.instruments.forEach((connection) => {
      connection.instrument.disconnect();
      connection.instrument.dispose();
    });
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
