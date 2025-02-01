// src/features/composition/services/CompositionEngine.ts
import { CompositionEngine } from "../types";
import { TransportEngine } from "../../transport/types";
import { SamplerEngine } from "../../sampler/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine, TrackType } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { CompositionTransportService } from "./CompositionTransportService";
import { CompositionSamplerService } from "./CompositionSamplerService";
import { CompositionMixService } from "./CompositionMixService";
import { CompositionClipService } from "./CompositionClipService";
import { CompositionAutomationService } from "./CompositionAutomationService";
import { MidiFile } from "midifile-ts";

export class CompositionEngineImpl implements CompositionEngine {
  private disposed = false;
  private readonly transportService: CompositionTransportService;
  private readonly mixService: CompositionMixService;
  private readonly samplerService: CompositionSamplerService;
  private readonly clipService: CompositionClipService;
  private readonly automationService: CompositionAutomationService;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly mixEngine: MixEngine,
    public readonly samplerEngine: SamplerEngine,
    public readonly clipEngine: ClipEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.transportService = new CompositionTransportService(transportEngine);
    this.mixService = new CompositionMixService(mixEngine);
    this.samplerService = new CompositionSamplerService(samplerEngine);
    this.clipService = new CompositionClipService(clipEngine);
    this.automationService = new CompositionAutomationService(automationEngine);
  }

  // Transport methods
  async play(time?: number): Promise<void> {
    return this.transportService.play(time);
  }
  pause(): void {
    return this.transportService.pause();
  }
  stop(): void {
    return this.transportService.stop();
  }
  seekTo(time: number): void {
    return this.transportService.seekTo(time);
  }
  setTempo(tempo: number): void {
    return this.transportService.setTempo(tempo);
  }
  setTimeSignature(numerator: number, denominator: number): void {
    return this.transportService.setTimeSignature(numerator, denominator);
  }
  startTapTempo(): void {
    return this.transportService.startTapTempo();
  }
  endTapTempo(): void {
    return this.transportService.endTapTempo();
  }
  setLoop(enabled: boolean): void {
    return this.transportService.setLoop(enabled);
  }
  setLoopPoints(start: number, end: number): void {
    return this.transportService.setLoopPoints(start, end);
  }
  getTransportDuration(): number {
    return this.transportService.getTransportDuration();
  }
  setTransportDuration(duration: number): void {
    return this.transportService.setTransportDuration(duration);
  }
  getTransportPosition(): number {
    return this.transportService.getTransportPosition();
  }

  // Mix methods
  createTrack(type: TrackType, name?: string): void {
    return this.mixService.createTrack(type, name);
  }
  createSend(trackId: string, returnTrackId: string, name?: string): void {
    return this.mixService.createSend(trackId, returnTrackId, name);
  }
  createReturnTrack(name?: string): void {
    return this.mixService.createReturnTrack(name);
  }
  createSoundChain(trackId: string, name?: string): void {
    return this.mixService.createSoundChain(trackId, name);
  }
  createChain(
    trackId: string,
    name?: string,
    instrument?: AudioNode | null,
  ): void {
    return this.mixService.createChain(trackId, name, instrument);
  }

  // Sampler methods

  // Clip Methods
  importMidiFile(trackId: string, file: File, name?: string): void {
    return this.clipService.importMidiFile(trackId, file, name);
  }
  createMidiClip(trackId: string, midiData: MidiFile, name?: string): void {
    return this.clipService.createMidiClip(trackId, midiData, name);
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    await this.transportService.dispose();
    await this.mixService.dispose();
    await this.samplerService.dispose();
    this.clipService.dispose();
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
