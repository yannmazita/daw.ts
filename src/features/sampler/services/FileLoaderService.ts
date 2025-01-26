// src/features/sampler/services/FileLoaderService.ts
export class FileLoaderService {
  private audioContext: AudioContext;
  private bufferCache: Map<string, AudioBuffer>;
  private root = "";

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bufferCache = new Map();
  }

  setRoot(path: string) {
    this.root = path;
  }

  async loadAudioFile(path: string): Promise<AudioBuffer> {
    const fullPath = this.root + path;

    // Check cache first
    if (this.bufferCache.has(fullPath)) {
      return this.bufferCache.get(fullPath)!;
    }

    // Load and decode audio file
    const response = await fetch(fullPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Cache for reuse
    this.bufferCache.set(fullPath, audioBuffer);

    return audioBuffer;
  }

  async loadTextFile(path: string): Promise<string> {
    const response = await fetch(this.root + path);
    return response.text();
  }

  clearCache() {
    this.bufferCache.clear();
  }
}
