// src/features/sampler/services/FileLoaderService.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/

import { FileWithDirectoryAndFileHandle } from "browser-fs-access";
import { FileLocal, FileRemote, FilesMap, FilesTree } from "../types/files";
import {
  encodeHashes,
  pathGetExt,
  pathGetSubDirectory,
} from "@sfz-tools/core/dist/utils";
import { apiArrayBuffer, apiText } from "@sfz-tools/core/dist/api";

export class FileLoaderService {
  files: FilesMap = {};
  filesTree: FilesTree = {};
  root = "";
  private abortControllers = new Map<string, AbortController>();

  constructor(private audioContext: AudioContext) {}

  addDirectory(files: string[] | FileWithDirectoryAndFileHandle[]) {
    files.forEach((file: string | FileWithDirectoryAndFileHandle) =>
      this.addFile(file),
    );
  }

  addToFileTree(key: string) {
    key
      .split("/")
      .reduce((o: any, k: string) => (o[k] = o[k] || {}), this.filesTree);
  }

  addFile(
    file: string | FileWithDirectoryAndFileHandle,
  ): FileLocal | FileRemote {
    const path: string = decodeURI(
      typeof file === "string" ? file : file.webkitRelativePath,
    );
    if (path === this.root) {
      throw new Error(`Attempted to add root directory as a file: ${path}`);
    }
    const fileKey: string = pathGetSubDirectory(path, this.root);
    let newFile: FileLocal | FileRemote;
    if (typeof file === "string") {
      newFile = {
        ext: pathGetExt(file),
        contents: null,
        path,
      };
    } else {
      newFile = {
        ext: pathGetExt(file.webkitRelativePath),
        contents: null,
        path,
        handle: file,
      };
    }
    this.files[fileKey] = newFile;
    this.addToFileTree(fileKey);
    return newFile;
  }

  addFileContents(file: string, contents: any): FileLocal | FileRemote {
    const path: string = decodeURI(file);
    const fileKey: string = pathGetSubDirectory(path, this.root);
    const newFile: FileLocal | FileRemote = {
      ext: pathGetExt(path),
      contents,
      path,
    };
    this.files[fileKey] = newFile;
    return newFile;
  }

  async loadFileLocal(
    file: FileLocal,
    buffer = false,
    signal?: AbortSignal,
  ): Promise<FileLocal> {
    if (!file.handle) {
      throw new Error(`File handle is missing for local file: ${file.path}`);
    }
    try {
      if (buffer === true) {
        const arrayBuffer: ArrayBuffer = await file.handle.arrayBuffer();
        if (this.audioContext && arrayBuffer) {
          file.contents = await this.audioContext.decodeAudioData(arrayBuffer);
        }
      } else {
        file.contents = await file.handle.text();
      }
      return file;
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("File loading aborted:", file.path);
        throw new Error(`File loading aborted: ${file.path}`);
      }
      console.error("Error loading local file:", file.path, error);
      throw new Error(
        `Error loading local file: ${file.path} ${error.message}`,
      );
    }
  }

  async loadFileRemote(
    file: FileRemote,
    buffer = false,
    signal?: AbortSignal,
  ): Promise<FileRemote> {
    try {
      if (buffer === true) {
        const arrayBuffer: ArrayBuffer = await apiArrayBuffer(
          encodeHashes(file.path),
        );
        if (this.audioContext) {
          file.contents = await this.audioContext.decodeAudioData(arrayBuffer);
        }
      } else {
        file.contents = await apiText(encodeHashes(file.path));
      }
      return file;
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("File loading aborted:", file.path);
        throw new Error(`File loading aborted: ${file.path}`);
      }
      console.error("Error loading remote file:", file.path, error);
      throw new Error(
        `Error loading remote file: ${file.path} ${error.message}`,
      );
    }
  }

  async getFile(
    file: string | FileLocal | FileRemote | undefined,
    buffer = false,
    signal?: AbortSignal,
  ): Promise<FileLocal | FileRemote | undefined> {
    if (!file) return;
    try {
      if (typeof file === "string") {
        if (pathGetExt(file).length === 0) return;
        const fileKey: string = pathGetSubDirectory(file, this.root);
        console.log("fileKey", fileKey);
        let fileRef: FileLocal | FileRemote | undefined = this.files[fileKey];
        console.log("fileRef", fileRef);
        if (!fileRef) fileRef = this.addFile(file);
        console.log("fileRef", fileRef);
        if (fileRef?.contents) return fileRef;
        if (file.startsWith("http"))
          return await this.loadFileRemote(
            fileRef as FileRemote,
            buffer,
            signal,
          );
        return await this.loadFileLocal(fileRef as FileLocal, buffer, signal);
      }
      if (file.contents) return file;
      if ("handle" in file)
        return await this.loadFileLocal(file, buffer, signal);
      return await this.loadFileRemote(file, buffer, signal);
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("File loading aborted:", file);
        throw new Error("File loading aborted");
      }
      console.error("Error getting file:", file, error);
      throw new Error("Error getting file");
    }
  }

  setRoot(dir: string) {
    this.root = dir;
  }

  resetFiles() {
    this.files = {};
    this.filesTree = {};
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  createAbortController(key: string): AbortController {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key)?.abort();
    }
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }
  abortFileLoad(key: string) {
    this.abortControllers.get(key)?.abort();
    this.abortControllers.delete(key);
  }
}
