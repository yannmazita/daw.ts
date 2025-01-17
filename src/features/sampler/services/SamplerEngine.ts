// src/features/sampler/services/SamplerEngine.ts
import * as Tone from "tone";
import {
  SamplerEngine,
  Instrument,
  Sample,
  SamplerState,
  SFZRegion,
} from "../types";
import { FileLoader } from "../utils/fileLoader";
import { Midi } from "@tonejs/midi";
import { EngineState } from "@/core/stores/useEngineStore";
import { parseHeaders, parseSfz } from "@sfz-tools/core/dist/parse";
import { pathGetDirectory } from "@sfz-tools/core/dist/utils";
import { ParseHeader, ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";

class SampleImpl implements Sample {
  buffer: Tone.ToneAudioBuffer;
  url: string;
  constructor(buffer: Tone.ToneAudioBuffer, url: string) {
    this.buffer = buffer;
    this.url = url;
  }
  dispose(): void {
    this.buffer.dispose();
  }
}

export class SamplerEngineImpl implements SamplerEngine {
  private fileLoader: FileLoader = new FileLoader();

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
    try {
      const instrumentId = crypto.randomUUID();
      const file = this.fileLoader.addFile(sfzFile);
      const fileLoaded = await this.fileLoader.getFile(file);

      if (!fileLoaded) {
        throw new Error("Failed to load SFZ file");
      }

      const prefix: string = pathGetDirectory(fileLoaded.path);
      let headers: ParseHeader[] = [];

      if (fileLoaded.ext === "sfz") {
        headers = await parseSfz(fileLoaded.contents, prefix);
      } else if (fileLoaded.ext === "json") {
        headers = JSON.parse(fileLoaded.contents).elements;
      } else {
        throw new Error("Unsupported file extension");
      }

      const regions: ParseOpcodeObj[] = parseHeaders(headers, prefix);
      const samples: Record<string, Sample> = {};

      for (const region of regions) {
        if (!region.sample) continue;

        const sampleFile = await this.fileLoader.getFile(region.sample, true);

        if (sampleFile?.contents) {
          samples[region.sample] = new SampleImpl(
            sampleFile.contents,
            region.sample,
          );
        }
      }

      const instrument: Instrument = {
        id: instrumentId,
        name: sfzFile.name,
        samples,
        regions: regions as SFZRegion[],
      };

      const newInstruments = {
        ...state.instruments,
        [instrumentId]: instrument,
      };

      return { ...state, instruments: newInstruments };
    } catch (error) {
      console.error("Error loading instrument:", error);
      throw new Error("Failed to load instrument");
    }
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
    const newSamplers = {
      ...state.samplers,
      [instrumentId]: sampler,
    };
    return { ...state, samplers: newSamplers };
  }

  dispose(state: SamplerState): SamplerState {
    for (const samplerId in state.samplers) {
      state.samplers[samplerId].dispose();
    }
    for (const instrumentId in state.instruments) {
      const instrument = state.instruments[instrumentId];
      for (const sampleId in instrument.samples) {
        instrument.samples[sampleId].dispose();
      }
    }
    return { instruments: {}, samplers: {} };
  }
}
