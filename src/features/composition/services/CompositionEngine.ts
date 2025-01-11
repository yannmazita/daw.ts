// src/features/composition/services/CompositionEngine.ts
import { CompositionEngine } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine, CompositionClip } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { CompositionTransportService } from "./CompositionTransportService";
import { CompositionMixService } from "./CompositionMixService";
import { CompositionClipService } from "./CompositionClipService";
import { CompositionAutomationService } from "./CompositionAutomationService";
import { CompositionTrackService } from "./CompositionTrackService";
import { TrackEngine, Track } from "@/features/tracks/types";
import { Device, DeviceType, Send, MixerTrack } from "@/features/mix/types";
import { Subdivision } from "tone/build/esm/core/type/Units";

export class CompositionEngineImpl implements CompositionEngine {
  private disposed = false;
  private readonly transportService: CompositionTransportService;
  private readonly mixService: CompositionMixService;
  private readonly clipService: CompositionClipService;
  private readonly trackService: CompositionTrackService;
  private readonly automationService: CompositionAutomationService;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly mixEngine: MixEngine,
    public readonly clipEngine: ClipEngine,
    public readonly trackEngine: TrackEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.transportService = new CompositionTransportService(transportEngine);
    this.mixService = new CompositionMixService(mixEngine);
    this.clipService = new CompositionClipService(clipEngine);
    this.trackService = new CompositionTrackService(
      trackEngine,
      clipEngine,
      mixEngine,
    );
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
  setSwing(amount: number, subdivision?: Subdivision): void {
    return this.transportService.setSwing(amount, subdivision);
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
  setTransportPosition(position: number): void {
    return this.transportService.setTransportPosition(position);
  }

  // Mix methods
  createMixerTrack(type: MixerTrack["type"], name?: string): void {
    return this.mixService.createMixerTrack(type, name);
  }
  deleteMixerTrack(trackId: string): void {
    return this.mixService.deleteMixerTrack(trackId);
  }
  moveMixerTrack(trackId: string, newIndex: number): void {
    return this.mixService.moveMixerTrack(trackId, newIndex);
  }
  setMixerTrackSolo(trackId: string, solo: boolean): void {
    return this.mixService.setSolo(trackId, solo);
  }
  setMixerTrackMute(trackId: string, mute: boolean): void {
    return this.mixService.setMute(trackId, mute);
  }
  setMixerTrackVolume(trackId: string, volume: number): void {
    return this.mixService.setVolume(trackId, volume);
  }
  setMixerTrackPan(trackId: string, pan: number): void {
    return this.mixService.setPan(trackId, pan);
  }
  getMixerTrackMeterValues(trackId: string): number | number[] {
    return this.mixService.getMeterValues(trackId);
  }
  addDevice(parentId: string, deviceType: DeviceType): void {
    return this.mixService.addDevice(parentId, deviceType);
  }
  updateDevice(
    parentId: string,
    deviceId: string,
    updates: Partial<Device>,
  ): void {
    return this.mixService.updateDevice(parentId, deviceId, updates);
  }
  removeDevice(parentId: string, deviceId: string): void {
    return this.mixService.removeDevice(parentId, deviceId);
  }
  createSend(sourceTrackId: string, targetTrackId: string): void {
    return this.mixService.createSend(sourceTrackId, targetTrackId);
  }
  updateSend(
    baseTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): void {
    return this.mixService.updateSend(baseTrackId, sendId, updates);
  }
  removeSend(baseTrackId: string, sendId: string): void {
    return this.mixService.removeSend(baseTrackId, sendId);
  }
  setSendAmount(baseTrackId: string, sendId: string, amount: number): void {
    return this.mixService.setSendAmount(baseTrackId, sendId, amount);
  }
  getTrackSends(baseTrackId: string): Send[] {
    return this.mixService.getTrackSends(baseTrackId);
  }
  disconnectTrackSends(baseTrackId: string): void {
    return this.mixService.disconnectTrackSends(baseTrackId);
  }
  createSoundChain(name?: string): void {
    return this.mixService.createSoundChain(name);
  }

  // Track Methods
  createTrack(type: Track["type"], name?: string): void {
    return this.trackService.createTrack(type, name);
  }
  updateTrack(trackId: string, updates: Partial<Track>): void {
    return this.trackService.updateTrack(trackId, updates);
  }
  deleteTrack(trackId: string): void {
    return this.trackService.deleteTrack(trackId);
  }
  moveTrack(trackId: string, position: number): void {
    return this.trackService.moveTrack(trackId, position);
  }
  setTrackSolo(trackId: string, solo: boolean): void {
    return this.trackService.setSolo(trackId, solo);
  }
  setTrackMute(trackId: string, mute: boolean): void {
    return this.trackService.setMute(trackId, mute);
  }
  setArmed(trackId: string, armed: boolean): void {
    return this.trackService.setArmed(trackId, armed);
  }
  setTrackPan(trackId: string, pan: number): void {
    return this.trackService.setPan(trackId, pan);
  }
  setTrackVolume(trackId: string, volume: number): void {
    return this.trackService.setVolume(trackId, volume);
  }
  getTrackMeterValues(trackId: string): number | number[] {
    return this.trackService.getMeterValues(trackId);
  }

  // Clip Methods
  createClip(
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
  ): void {
    return this.clipService.createClip(type, startTime, parentId, name);
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
  playClip(clipId: string, startTime?: number): void {
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

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.transportService.dispose();
    this.mixService.dispose();
    this.clipService.dispose();
    this.trackService.dispose();
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
