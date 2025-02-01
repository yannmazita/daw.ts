// src/features/sampler/services/SamplerEngine.ts
import { TransportEngine } from "@/features/transport/types";
import { SamplerEngine, SamplerState } from "../types";
import { FileLoaderService } from "./FileLoaderService";
import { SfzPlayerService } from "./SfzPlayerService";

export class SamplerEngineImpl implements SamplerEngine {
  private loader: FileLoaderService;
  private player: SfzPlayerService;
  private _outputNode: GainNode;

  constructor(
    private audioContext: AudioContext,
    private transport: TransportEngine,
  ) {
    this.loader = new FileLoaderService(this.audioContext);
    this.player = new SfzPlayerService(
      this.audioContext,
      this.loader,
      this.transport,
    );
    this._outputNode = this.audioContext.createGain();
  }

  getOutputNode(): GainNode {
    return this._outputNode;
  }

  async dispose(state: SamplerState): Promise<SamplerState> {
    this.player.dispose();
    return Promise.resolve(state);
  }
}
