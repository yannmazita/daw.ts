// src/features/composition/services/CompositionEngine.ts
import { CompositionEngine } from "../types";
import { TransportEngine } from "../../transport/types";
import { SamplerEngine } from "../../sampler/types";
import { ClipEngine, CompositionClip } from "../../clips/types";
import { MixEngine, TrackType } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { CompositionTransportService } from "./CompositionTransportService";
import { CompositionSamplerService } from "./CompositionSamplerService";
import { CompositionMixService } from "./CompositionMixService";
import { CompositionClipService } from "./CompositionClipService";
import { CompositionAutomationService } from "./CompositionAutomationService";
import { FileLoaderService } from "@/features/sampler/services/FileLoaderService";

export class CompositionEngineImpl implements CompositionEngine {
  private disposed = false;
  private readonly transportService: CompositionTransportService;
  private readonly samplerService: CompositionSamplerService;
  private readonly mixService: CompositionMixService;
  private readonly clipService: CompositionClipService;
  private readonly automationService: CompositionAutomationService;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly samplerEngine: SamplerEngine,
    public readonly mixEngine: MixEngine,
    public readonly clipEngine: ClipEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.transportService = new CompositionTransportService(transportEngine);
    this.samplerService = new CompositionSamplerService(samplerEngine);
    this.mixService = new CompositionMixService(mixEngine);
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
  async loadLocalInstrument(): Promise<void> {
    return this.samplerService.loadLocalInstrument();
  }
  getFileLoader(): FileLoaderService {
    return this.samplerService.getFileLoader();
  }

  // Clip Methods
  importMidi(
    file: File,
    clipId?: string,
    trackId?: string,
    instrumentId?: string,
  ): Promise<void> {
    return this.clipService.importMidi(file, clipId, trackId, instrumentId);
  }
  exportMidi(clipId: string): Promise<void> {
    return this.clipService.exportMidi(clipId);
  }
  createClip(
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
    instrumentId?: string,
  ): void {
    return this.clipService.createClip(
      type,
      startTime,
      parentId,
      name,
      instrumentId,
    );
  }
  deleteClip(clipId: string): void {
    return this.clipService.deleteClip(clipId);
  }
  moveClip(clipId: string, startTime: number): void {
    return this.clipService.moveClip(clipId, startTime);
  }
  setClipFades(clipId: string, fadeIn: number, fadeOut: number): void {
    return this.clipService.setClipFades(clipId, fadeIn, fadeOut);
  }
  setClipInstrument(clipId: string, instrumentId: string): void {
    return this.clipService.setClipInstrument(clipId, instrumentId);
  }
  async playClip(clipId: string, startTime?: number): Promise<void> {
    return this.clipService.playClip(clipId, startTime);
  }
  pauseClip(clipId: string): void {
    return this.clipService.pauseClip(clipId);
  }
  stopClip(clipId: string): void {
    return this.clipService.stopClip(clipId);
  }
  getClipPlaybackPosition(clipId: string): number {
    return this.clipService.getClipPlaybackPosition(clipId);
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    await this.transportService.dispose();
    await this.samplerService.dispose();
    await this.mixService.dispose();
    this.clipService.dispose();
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
