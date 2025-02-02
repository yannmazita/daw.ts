// src/features/sampler/services/FileLoaderService.ts
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

export class FileLoaderService {
  private audioContext: AudioContext;
  private bufferCache: Map<string, AudioBuffer>;
  private lruQueue: string[] = [];
  private maxCacheSize = 1024 * 1024 * 1024 * 2; // 2 GB
  private fileMap: Map<string, FileWithDirectoryAndFileHandle>;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bufferCache = new Map();
    this.fileMap = new Map(); // stores paths of all files loaded from directory
  }

  private updateLRU(fullPath: string) {
    this.lruQueue = this.lruQueue.filter((p) => p !== fullPath);
    this.lruQueue.push(fullPath);
  }

  private enforceMemoryLimit() {
    let totalSize = 0;
    for (const buffer of this.bufferCache.values()) {
      totalSize += buffer.length * 4; // audio samples in AudioBuffer are float32 ie 4 bytes
    }

    while (totalSize > this.maxCacheSize) {
      const headPath = this.lruQueue.shift();
      if (!headPath) {
        break;
      }
      const buffer = this.bufferCache.get(headPath);
      if (buffer) {
        totalSize -= buffer.length * 4;
        this.bufferCache.delete(headPath);
      }
    }
  }

  loadDirectory(
    blobs: FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[],
  ) {
    // Reset state for new directory
    this.fileMap.clear();
    this.bufferCache.clear();

    // Process blobs
    blobs.forEach((blob) => {
      if ("webkitRelativePath" in blob) {
        // ie: we're dealing with FileWithDirectoryAndFileHandle
        this.fileMap.set(blob.webkitRelativePath, blob);
        // todo: handle FileSystemDirectoryHandle
      }
    });
    console.log("Loaded directory", this.fileMap);
  }

  /**
   * Load an audio file.
   * @param relativePath - Audio file relative path.
   * @returns The decoded audio buffer.
   * @throws If file not found in file map.
   * */
  async loadAudioFile(relativePath: string): Promise<AudioBuffer> {
    // Check cache first
    if (this.bufferCache.has(relativePath)) {
      this.updateLRU(relativePath);
      return this.bufferCache.get(relativePath)!;
    }

    // Get file from map
    const file = this.fileMap.get(relativePath);
    if (!file) {
      throw new Error(`File not found: ${relativePath}`);
    }

    // Load and decode audio file
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Cache for reuse
    this.bufferCache.set(file.webkitRelativePath, audioBuffer);
    this.lruQueue.push(file.webkitRelativePath);
    this.enforceMemoryLimit();

    return audioBuffer;
  }

  /**
   * Load an SFZ file.
   * @param relativePath - SFZ file relative path.
   * @returns The SFZ file content.
   * @throws If file not found.
   * */
  async loadSfzFile(relativePath: string): Promise<string> {
    const file = this.fileMap.get(relativePath);
    if (!file) {
      throw new Error(`File not found: ${relativePath}`);
    }
    return file.text();
  }

  clearRegionCache(path: string) {
    const fullPath = this.root + path;
    this.bufferCache.delete(fullPath);
  }

  clearCache() {
    this.bufferCache.clear();
  }

  dispose() {
    this.clearCache();
  }
}
