// src/features/sampler/services/FileLoaderService.ts
export class FileLoaderService {
  private audioContext: AudioContext;
  private bufferCache: Map<string, AudioBuffer>;
  private lruQueue: string[] = [];
  private maxCacheSize = 1024 * 1024 * 1024 * 2; // 2 GB
  private root = "";

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bufferCache = new Map();
  }

  setRoot(path: string) {
    this.root = path;
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

  /**
   * Load an audio file.
   * @param path - The path to the audio file.
   * @returns The decoded audio buffer.
   * */
  async loadAudioFile(path: string): Promise<AudioBuffer> {
    const fullPath = this.root + path;

    // Check cache first
    if (this.bufferCache.has(fullPath)) {
      this.updateLRU(fullPath);
      return this.bufferCache.get(fullPath)!;
    }

    // Load and decode audio file
    const response = await fetch(fullPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Cache for reuse
    this.bufferCache.set(fullPath, audioBuffer);
    this.lruQueue.push(fullPath);
    this.enforceMemoryLimit();

    return audioBuffer;
  }

  async loadTextFile(path: string): Promise<string> {
    const response = await fetch(this.root + path);
    return response.text();
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
