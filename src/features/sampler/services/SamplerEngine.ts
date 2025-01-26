// src/features/sampler/services/SamplerEngine.ts
import { SamplerState } from "../types";
import { FileLoaderService } from "./FileLoaderService";
import { SfzPlayerService } from "./SfzPlayerService";

export class SamplerEngineImpl {
  private loader: FileLoaderService;
  private player: SfzPlayerService;

  constructor(private audioContext: AudioContext) {
    this.loader = new FileLoaderService(this.audioContext);
    this.player = new SfzPlayerService(this.audioContext, this.loader);
  }

  async dispose(state: SamplerState): Promise<SamplerState> {
    this.player.dispose();
    return Promise.resolve(state);
  }
}
