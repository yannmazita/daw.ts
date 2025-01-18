// src/features/sampler/services/SamplerEngine.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import * as Tone from "tone";
import { SamplerEngine, SamplerState } from "../types";
import { FileLoader } from "../utils/fileLoader";
import { Midi } from "@tonejs/midi";
import { EngineState } from "@/core/stores/useEngineStore";
import { pathGetExt, pathGetRoot } from "@sfz-tools/core/dist/utils";
import { apiJson } from "@sfz-tools/core/dist/api";
import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { HeaderPreset } from "../types/player";

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
    return audioFile;
  }

  async loadLocalInstrument(state: SamplerState): Promise<SamplerState> {
    try {
      const blobs: FileWithDirectoryAndFileHandle[] = (await directoryOpen({
        recursive: true,
      })) as FileWithDirectoryAndFileHandle[];
      console.log(`${blobs.length} files selected.`);
      const root = pathGetRoot(blobs[0].webkitRelativePath);
      this.loadDirectory(root, blobs);
      return state;
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
      console.warn("The user aborted a request.");
      return state;
    }
  }

  async loadRemoteInstrument(
    preset: HeaderPreset,
    state: SamplerState,
  ): Promise<SamplerState> {
    const branch: string = preset.branch ?? "compact";
    const response: any = await apiJson(
      `https://api.github.com/repos/${preset.id}/git/trees/${branch}?recursive=1`,
    );
    const paths: string[] = response.tree.map(
      (file: any) =>
        `https://raw.githubusercontent.com/${preset.id}/${branch}/${file.path}`,
    );
    const root = `https://raw.githubusercontent.com/${preset.id}/${branch}/`;
    const audioFile = this.loadDirectory(root, paths);
    return await this.loadSfz(state, audioFile, root);
  }

  async startSamplerPlayback(
    state: EngineState,
    clipId: string,
    startTime = 0,
  ): Promise<EngineState> {
    const clip = state.clips.clips[clipId];
    const midi = clip.data as Midi;
    console.log("midi", midi);
    Tone.getTransport().PPQ = midi.header.ppq;

    // todo
    return state;
  }

  getInstrumentsLoader(): FileLoader {
    return this.loader;
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
