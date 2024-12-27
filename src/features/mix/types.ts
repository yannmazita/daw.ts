// src/features/mix/types.ts
import {
  EffectName,
  EffectOptions,
  ToneEffectType,
} from "../../core/types/effect";
import { Channel, Gain, Meter } from "tone";
import { AudioMeterData } from "../../core/types/audio";

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
  returnTrackId: string;
  preFader: boolean;
  gain: Gain;
}

export interface MixerTrack {
  id: string;
  name: string;
  type: "return" | "master";

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  preDevices: ToneEffectType[];
  postDevices: ToneEffectType[];
  sends: Send[];
  meter: Meter;
}

export interface PersistableMixerChannel {
  id: string;
  name: string;
  type: "return" | "master";
}

export interface MixState {
  mixerTracks: Record<string, MixerTrack>;
  devices: Record<string, Device>;

  // Metering state
  meterData: Record<string, AudioMeterData>;
}

export interface PersistableMixState {
  mixerTracks: Record<string, PersistableMixerChannel>;
  devices: Record<string, PersistableDevice>;
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
  updateSend(mixerTrackId: string, sendId: string, updates: Partial<Send>): void;
  removeSend(mixerTrackId: string, sendId: string): void;
  setSendAmount(mixerTrackId: string, sendId: string, amount: number): void;

  // Metering
  getMeterData(mixerTrackId: string): AudioMeterData;

  // State
  getState(): MixState;
  dispose(): void;
}
