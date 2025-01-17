// src/features/sampler/utils/fileLoader.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import * as Tone from "tone";
import {
  FileLocal,
  FileRemote,
  FilesMap,
  FilesTree,
  FileWithHandle,
} from "./fileLoaderTypes";
import { apiArrayBuffer, apiText } from "@sfz-tools/core/dist/api";
import {
  encodeHashes,
  pathGetExt,
  pathGetSubDirectory,
} from "@sfz-tools/core/dist/utils";

export class FileLoader {
  audio: AudioContext | undefined;
  files: FilesMap = {};
  filesTree: FilesTree = {};
  root = "";

  constructor() {
    if (window.AudioContext) {
      this.audio = new window.AudioContext();
    }
  }

  addDirectory(files: string[] | FileWithHandle[]) {
    files.forEach((file: string | FileWithHandle) => this.addFile(file));
  }

  addFile(file: string | FileWithHandle) {
    const path: string = decodeURI(
      typeof file === "string" ? file : file.webkitRelativePath || file.name,
    );
    if (path === this.root) return;
    const fileKey: string = pathGetSubDirectory(path, this.root);
    if (typeof file === "string") {
      this.files[fileKey] = {
        ext: pathGetExt(file),
        contents: null,
        path,
      };
    } else {
      this.files[fileKey] = {
        ext: pathGetExt(file.webkitRelativePath || file.name),
        contents: null,
        path,
        handle: file,
      };
    }
    this.addToFileTree(fileKey);
    return this.files[fileKey];
  }

  addFileContents(file: string, contents: any) {
    const path: string = decodeURI(file);
    const fileKey: string = pathGetSubDirectory(path, this.root);
    this.files[fileKey] = {
      ext: pathGetExt(path),
      contents,
      path,
    };
    return this.files[fileKey];
  }

  addToFileTree(key: string) {
    key
      .split("/")
      .reduce((o: any, k: string) => (o[k] = o[k] || {}), this.filesTree);
  }

  async loadFileLocal(file: FileLocal, buffer = false) {
    if (!file.handle) return file;
    if (buffer === true) {
      const arrayBuffer: ArrayBuffer = await file.handle.arrayBuffer();
      if (this.audio && arrayBuffer) {
        try {
          const audioBuffer = await this.audio.decodeAudioData(arrayBuffer);
          file.contents = await new Promise<Tone.ToneAudioBuffer>(
            (resolve, reject) => {
              const buffer = new Tone.ToneAudioBuffer(
                audioBuffer,
                () => {
                  resolve(buffer);
                },
                (error) => {
                  reject(error);
                },
              );
            },
          );
        } catch (error) {
          console.error("Error decoding audio data:", error);
          throw error;
        }
      }
    } else {
      const text = await file.handle.text();
      file.contents = text;
    }
    return file;
  }

  async loadFileRemote(file: FileRemote, buffer = false) {
    if (buffer === true) {
      const arrayBuffer: ArrayBuffer = await apiArrayBuffer(
        encodeHashes(file.path),
      );
      if (this.audio && arrayBuffer) {
        try {
          const audioBuffer = await this.audio.decodeAudioData(arrayBuffer);
          file.contents = await new Promise<Tone.ToneAudioBuffer>(
            (resolve, reject) => {
              const buffer = new Tone.ToneAudioBuffer(
                audioBuffer,
                () => {
                  resolve(buffer);
                },
                (error) => {
                  reject(error);
                },
              );
            },
          );
        } catch (error) {
          console.error("Error decoding audio data:", error);
          throw error;
        }
      }
    } else {
      file.contents = await apiText(encodeHashes(file.path));
    }
    return file;
  }

  async getFile(
    file: string | FileLocal | FileRemote | undefined,
    buffer = false,
  ) {
    if (!file) return;
    if (typeof file === "string") {
      if (pathGetExt(file).length === 0) return;
      const fileKey: string = pathGetSubDirectory(file, this.root);
      let fileRef: FileLocal | FileRemote | undefined = this.files[fileKey];
      if (!fileRef) fileRef = this.addFile(file);
      if (fileRef?.contents) return fileRef;
      if (file.startsWith("http"))
        return await this.loadFileRemote(fileRef as FileRemote, buffer);
      return await this.loadFileLocal(fileRef as FileLocal, buffer);
    }
    if (file.contents) return file;
    if ("handle" in file) return await this.loadFileLocal(file, buffer);
    return await this.loadFileRemote(file, buffer);
  }

  setRoot(dir: string) {
    this.root = dir;
  }

  resetFiles() {
    this.files = {};
    this.filesTree = {};
  }
}
