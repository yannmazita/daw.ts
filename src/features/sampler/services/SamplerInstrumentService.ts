// src/features/sampler/services/SamplerInstrumentService.ts
import { TransportEngine } from "@/features/transport/types";
import { FileLoaderService } from "./FileLoaderService";
import { SfzPlayerService } from "./SfzPlayerService";

export class SamplerInstrumentService {
  private player: SfzPlayerService;
  private outputNode: GainNode;

  constructor(
    private audioContext: AudioContext,
    private transport: TransportEngine,
    private loader: FileLoaderService,
  ) {
    this.outputNode = this.audioContext.createGain();

    this.player = new SfzPlayerService(
      this.audioContext,
      this.loader,
      this.transport,
      this.outputNode,
    );
  }

  getOutputNode(): GainNode {
    return this.outputNode;
  }
}
