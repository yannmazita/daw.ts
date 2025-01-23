// src/features/sampler/services/SamplerEngine.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { SamplerEngine, SamplerState } from "../types";
import { FileLoaderService } from "./FileLoaderService";
import { pathGetExt, pathGetRoot } from "@sfz-tools/core/dist/utils";
import { SfzParsingService } from "./SfzParsingService";
import { FileLocal, FileRemote } from "../types/files";
import { ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";

export class SamplerEngineImpl implements SamplerEngine {
  private loader: FileLoaderService;
  private parser: SfzParsingService;

  constructor(private audioContext: AudioContext) {
    this.loader = new FileLoaderService(audioContext);
    this.parser = new SfzParsingService(this.loader);
  }

  private loadDirectory(files: string[] | FileWithDirectoryAndFileHandle[]) {
    let audioFile: string | undefined;
    let audioFileDepth = 1000;
    let audioFileJson: string | undefined;
    let audioFileJsonDepth = 1000;
    let interfaceFile: string | undefined;
    let interfaceFileDepth = 1000;
    let root = "";
    for (const file of files) {
      const path: string =
        typeof file === "string" ? file : file.webkitRelativePath;
      if (typeof file !== "string") root = pathGetRoot(file.webkitRelativePath);
      const depth: number = path.match(/\//g)?.length ?? 0;
      if (pathGetExt(path) === "sfz" && depth < audioFileDepth) {
        audioFile = path;
        audioFileDepth = depth;
      }
      if (path.endsWith(".sfz.json") && depth < audioFileJsonDepth) {
        audioFileJson = path;
        audioFileJsonDepth = depth;
      }
      if (pathGetExt(path) === "xml" && depth < interfaceFileDepth) {
        interfaceFile = path;
        interfaceFileDepth = depth;
      }
    }
    console.log("audioFile", audioFile);
    console.log("audioFileJson", audioFileJson);
    console.log("interfaceFile", interfaceFile);
    this.loader.resetFiles();
    this.loader.setRoot(root);
    this.loader.addDirectory(files);
    return { audioFile, audioFileJson, interfaceFile, root };
  }

  private async selectLocalFiles() {
    try {
      const blobs: FileWithDirectoryAndFileHandle[] = (await directoryOpen({
        recursive: true,
      })) as FileWithDirectoryAndFileHandle[];
      if (!blobs || blobs.length === 0) throw new Error("No files selected");
      console.log(`${blobs.length} files selected.`);
      return this.loadDirectory(blobs);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("The user aborted a request.");
        throw new Error("The user aborted a request.");
      }
      console.error("Error selecting local files:", err);
      throw new Error(`Error selecting local files: ${err.message}`);
    }
  }

  private async loadAndParseSfz(
    filePath: string,
    signal?: AbortSignal,
  ): Promise<ParseOpcodeObj[]> {
    try {
      const file: FileLocal | FileRemote | undefined =
        this.loader.files[filePath] || this.loader.addFile(filePath);
      if (!file) throw new Error(`SFZ file not found: ${filePath}`);
      const controller = this.loader.createAbortController(file.path);
      const loadedFile = await this.loader.getFile(
        file,
        false,
        controller.signal,
      );
      if (!loadedFile)
        throw new Error(`SFZ file could not be loaded: ${filePath}`);
      const regions = await this.parser.parse(loadedFile);
      this.loader.abortFileLoad(file.path);
      return regions;
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("SFZ file loading aborted:", filePath);
        throw new Error(`SFZ file loading aborted: ${filePath}`);
      }
      console.error("Error loading and parsing SFZ file:", filePath, error);
      throw new Error(
        `Error loading and parsing SFZ file: ${filePath} ${error.message}`,
      );
    }
  }

  private async loadAndParseJson(
    filePath: string,
    signal?: AbortSignal,
  ): Promise<ParseOpcodeObj[]> {
    try {
      const file: FileLocal | FileRemote | undefined =
        this.loader.files[filePath] || this.loader.addFile(filePath);
      if (!file) throw new Error(`JSON file not found: ${filePath}`);
      const controller = this.loader.createAbortController(file.path);
      const loadedFile = await this.loader.getFile(
        file,
        false,
        controller.signal,
      );
      if (!loadedFile)
        throw new Error(`JSON file could not be loaded: ${filePath}`);
      const regions = await this.parser.parse(loadedFile);
      this.loader.abortFileLoad(file.path);
      return regions;
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("JSON file loading aborted:", filePath);
        throw new Error(`JSON file loading aborted: ${filePath}`);
      }
      console.error("Error loading and parsing JSON file:", filePath, error);
      throw new Error(
        `Error loading and parsing JSON file: ${filePath} ${error.message}`,
      );
    }
  }

  async loadLocalInstrument() {
    try {
      const { audioFile, audioFileJson, root } = await this.selectLocalFiles();
      this.loader.setRoot(root);
      let regions: ParseOpcodeObj[] = [];
      if (audioFile) {
        regions = await this.loadAndParseSfz(audioFile);
      }
      if (audioFileJson) {
        regions = await this.loadAndParseJson(audioFileJson);
      }
      console.log("regions", regions);
    } catch (err: any) {
      console.error("Error loading local instrument:", err);
    }
  }

  getFileLoader(): FileLoaderService {
    return this.loader;
  }

  async dispose(state: SamplerState): Promise<SamplerState> {
    this.loader.resetFiles();
    return Promise.resolve(state);
  }
}
