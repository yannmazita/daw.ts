// src/features/sampler/services/SamplerEngine.ts
import * as Tone from "tone";
import { SamplerEngine, Instrument, Sample, SamplerState } from "../types";
import { SFZParser } from "../utils/sfzParser";
import { SampleUtils } from "../utils/sampleUtils";
import { Midi } from "@tonejs/midi";
import { EngineState } from "@/core/stores/useEngineStore";

export class SamplerEngineImpl implements SamplerEngine {
  private sampleUtils: SampleUtils = new SampleUtils();

  startSamplerPlayback(
    state: EngineState,
    clipId: string,
    startTime?: number = 0,
  ): EngineState {
    const clip = state.clips.clips[clipId];
    const midi = clip.data as Midi;
    Tone.getTransport().PPQ = midi.header.ppq;

    if (!clip.instrumentId) {
      console.error(`Clip with id ${clip.id} has no instrumentId`);
      return state;
    }
    const sampler = state.sampler.samplers[clip.instrumentId];

    if (!sampler) {
      console.error(`Sampler with id ${clip.instrumentId} not found`);
      return state;
    }
    Tone.getTransport().PPQ = midi.header.ppq;

    if (midi.tracks.length === 0) {
      console.warn("Midi file has no tracks");
      return state;
    }

    const now = Tone.now() + 0.5;

    midi.tracks.forEach((track) => {
      if (track.notes.length === 0) {
        console.warn("Midi track has no notes, skipping");
        return;
      }

      //schedule all of the events
      track.notes.forEach((note) => {
        sampler.triggerAttackRelease(
          note.midi,
          note.duration,
          note.time + now,
          note.velocity,
        );
      });
    });
    clip.node = sampler;
    const newState = { ...state, clips: { ...state.clips, [clipId]: clip } };

    return newState;
  }

  async loadInstrument(
    state: SamplerState,
    sfzFile: File,
  ): Promise<SamplerState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const instrumentId = crypto.randomUUID();

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error("FileReader result is empty"));
            return;
          }

          const sfzContent = event.target.result as string;
          const parser = new SFZParser(sfzContent);
          const { regions, global } = parser.parse();

          const loadedSamples = await this.sampleUtils.loadSamples(
            regions,
            global.defaultPath,
            instrumentId,
          );

          const samples: Record<string, Sample> = {};
          for (const url in loadedSamples) {
            samples[url] = {
              url: url,
              buffer: loadedSamples[url],
            };
          }

          const instrument: Instrument = {
            id: instrumentId,
            name: sfzFile.name,
            samples: samples,
            regions: regions,
          };

          const newInstruments = {
            ...state.instruments,
            [instrumentId]: instrument,
          };

          resolve({ ...state, instruments: newInstruments });
        } catch (error) {
          console.error("Error loading instrument:", error);
          reject(new Error("Failed to load instrument"));
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to read SFZ file"));
      };
      reader.readAsText(sfzFile);
    });
  }

  createSampler(state: SamplerState, instrumentId: string): SamplerState {
    const instrument = state.instruments[instrumentId];
    if (!instrument) {
      throw new Error(`Instrument ${instrumentId} not found`);
    }
    const sampler = new Tone.Sampler().toDestination();

    instrument.regions.forEach((region) => {
      const sample = Object.entries(instrument.samples).find(([key, _]) =>
        key.includes(region.sample),
      );
      if (!sample) {
        console.warn(`Sample not found for region ${region.sample}`);
        return;
      }
      sampler.add(region.loKey as Tone.Unit.MidiNote, sample[1].buffer);
    });
    const newInstruments = {
      ...state.instruments,
      [instrumentId]: { ...instrument, sampler: sampler },
    };
    return { ...state, instruments: newInstruments };
  }

  dispose(state: SamplerState): SamplerState {
    for (const samplerId in state.samplers) {
      state.samplers[samplerId].dispose();
    }
    this.sampleUtils.dispose();
    return { instruments: {}, samplers: {} };
  }
}
