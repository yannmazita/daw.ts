// src/features/mix/types.ts
import {
  EffectName,
  EffectOptions,
  ToneEffectType,
} from "../../core/types/audio";
import { Channel, Gain, Meter } from "tone";

export interface Device<T extends EffectOptions = EffectOptions> {
  id: string;
  type: EffectName;
  name: string;
  bypass: boolean;
  node: ToneEffectType;
  options?: T;
}

export interface PersistableDevice<T extends EffectOptions = EffectOptions> {
  id: string;
  type: EffectName;
  name: string;
  bypass: boolean;
  options?: T;
}

export interface Send {
  id: string;
  name: string;
  sourceTrackId: string; // arrangement Track id
  returnTrackId: string; // MixerTrack id
  preFader: boolean;
  gain: Gain;
}

export interface PersistableSend {
  id: string;
  name: string;
  sourceTrackId: string;
  returnTrackId: string;
  preFader: boolean;
  gainValue: number; // Serializable gain value
}

export interface MixerTrack {
  id: string;
  name: string;
  type: "return" | "master";
  deviceIds: {
    pre: string[];
    post: string[];
  };

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  meter: Meter;
}

export interface PersistableMixerTrack {
  id: string;
  name: string;
  type: "return" | "master";
}

export interface MixState {
  mixerTracks: Record<string, MixerTrack>;
  devices: Record<string, Device>;
  sends: Record<string, Send>;
  trackSends: Record<string, string[]>; // track id -> send IDs mapping
}

export interface PersistableMixState {
  mixerTracks: Record<string, PersistableMixerTrack>;
  devices: Record<string, PersistableDevice>;
  sends: Record<string, PersistableSend>;
  trackSends: Record<string, string[]>;
}

export interface MixEngine {
  createMixerTrack(type: MixerTrack["type"]): string;
  deleteMixerTrack(id: string): void;

  // Device management
  addDevice(mixerTrackId: string, deviceType: EffectName): string;
  updateDevice<T extends EffectOptions>(
    mixerTrackId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void;
  removeDevice(mixerTrackId: string, deviceId: string): void;

  // Sends
  createSend(fromId: string, toId: string): string;
  updateSend(baseTrackId: string, sendId: string, updates: Partial<Send>): void;
  removeSend(baseTrackId: string, sendId: string): void;
  setSendAmount(baseTrackId: string, sendId: string, amount: number): void;
  getTrackSends(baseTrackId: string): Send[];
  disconnectTrackSends(baseTrackId: string): void;

  // State
  getState(): MixState;
  dispose(): void;
}
