// src/features/sampler/services/SamplerEngine.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
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
import { pathGetExt, pathGetRoot } from "@sfz-tools/core/dist/utils";
import { pathGetDirectory } from "@sfz-tools/core/dist/utils";
import { apiJson } from "@sfz-tools/core/dist/api";
import { ParseHeader, ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";
import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { HeaderPreset } from "../types/player";

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
  private loader: FileLoader = new FileLoader();

  private loadDirectory(
    root: string,
    files: string[] | FileWithDirectoryAndFileHandle[],
  ) {
    let audioFile: string | FileWithDirectoryAndFileHandle | undefined;
    let audioFileDepth = 1000;
    let audioFileJson: string | FileWithDirectoryAndFileHandle | undefined;
    let audioFileJsonDepth = 1000;
    let interfaceFile: string | FileWithDirectoryAndFileHandle | undefined;
    let interfaceFileDepth = 1000;
    for (const file of files) {
      const path: string =
        typeof file === "string" ? file : file.webkitRelativePath;
      const depth: number = path.match(/\//g)?.length ?? 0;
      if (pathGetExt(path) === "sfz" && depth < audioFileDepth) {
        audioFile = file;
        audioFileDepth = depth;
      }
      if (path.endsWith(".sfz.json") && depth < audioFileJsonDepth) {
        audioFileJson = file;
        audioFileJsonDepth = depth;
      }
      if (pathGetExt(path) === "xml" && depth < interfaceFileDepth) {
        interfaceFile = file;
        interfaceFileDepth = depth;
      }
    }
    console.log("audioFile", audioFile);
    console.log("audioFileJson", audioFileJson);
    console.log("interfaceFile", interfaceFile);
    this.loader.resetFiles();
    this.loader.setRoot(root);
    this.loader.addDirectory(files);
  }

  async loadLocalInstrument(state: SamplerState): Promise<SamplerState> {
    try {
      const blobs: FileWithDirectoryAndFileHandle[] = (await directoryOpen({
        recursive: true,
      })) as FileWithDirectoryAndFileHandle[];
      console.log(`${blobs.length} files selected.`);
      this.loadDirectory(pathGetRoot(blobs[0].webkitRelativePath), blobs);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
      console.warn("The user aborted a request.");
    }
    return state;
  }

  async loadRemoteInstrument(preset: HeaderPreset) {
    const branch: string = preset.branch ?? "compact";
    const response: any = await apiJson(
      `https://api.github.com/repos/${preset.id}/git/trees/${branch}?recursive=1`,
    );
    const paths: string[] = response.tree.map(
      (file: any) =>
        `https://raw.githubusercontent.com/${preset.id}/${branch}/${file.path}`,
    );
    this.loadDirectory(
      `https://raw.githubusercontent.com/${preset.id}/${branch}/`,
      paths,
    );
  }

  startSamplerPlayback(
    state: EngineState,
    clipId: string,
    startTime = 0,
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

  async loadAndCreateSampler(
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
      this.fileLoader.setRoot(prefix); // Set the root path for the file loader
      let headers: ParseHeader[] = [];

      if (fileLoaded.ext === "sfz") {
        headers = await parseSfz(fileLoaded.contents, prefix);
      } else if (fileLoaded.ext === "json") {
        headers = JSON.parse(fileLoaded.contents).elements;
      } else {
        throw new Error("Unsupported file extension");
      }

      const regions: ParseOpcodeObj[] = parseHeaders(headers, prefix);
      console.log("Regions:", regions);
      const samples: Record<string, Sample> = {};

      for (const region of regions) {
        if (!region.sample) continue;

        const sampleFile = await this.fileLoader.getFile(region.sample, true);
        console.log("Sample file:", sampleFile);

        if (sampleFile?.contents) {
          samples[region.sample] = new SampleImpl(
            sampleFile.contents,
            region.sample,
          );
          console.log("Sample loaded:", region.sample);
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

      return { ...state, instruments: newInstruments, samplers: newSamplers };
    } catch (error) {
      console.error("Error loading instrument:", error);
      throw new Error("Failed to load instrument");
    }
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
