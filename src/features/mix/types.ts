// src/features/mix/types.ts
import { EffectOptions, ToneEffectType } from "../../core/types/effect";
import { Channel, Gain, Meter } from "tone";
import { DeviceType } from "@/core/types/audio";
import { InstrumentOptions, ToneInstrumentType } from "@/core/types/instrument";
import { ProcessorOptions, ToneProcessorType } from "@/core/types/processor";

export interface MixerTrackControlState {
  solo: boolean;
  mute: boolean;
  pan: number;
  volume: number;
}

export interface PersistableMixerTrackControlState {
  solo: boolean;
  mute: boolean;
  pan: number;
  volume: number;
}

export interface Device<
  T extends
    | EffectOptions
    | ProcessorOptions
    | InstrumentOptions = EffectOptions,
> {
  id: string;
  type: DeviceType;
  name: string;
  bypass: boolean;
  node: ToneEffectType | ToneProcessorType | ToneInstrumentType;
  options?: T;
}

export interface PersistableDevice<
  T extends
    | EffectOptions
    | ProcessorOptions
    | InstrumentOptions = EffectOptions,
> {
  id: string;
  type: DeviceType;
  name: string;
  bypass: boolean;
  options?: T;
}

export interface Send {
  id: string;
  name: string;
  sourceTrackId: string; // composition Track id
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
  controls: MixerTrackControlState;

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  meter: Meter;
}

export interface PersistableMixerTrack {
  id: string;
  name: string;
  type: "return" | "master";
  controls: PersistableMixerTrackControlState;
}

export interface MixState {
  mixerTracks: Record<string, MixerTrack>;
  mixerTrackOrder: string[];
  devices: Record<string, Device>;
  sends: Record<string, Send>;
  trackSends: Record<string, string[]>; // track id -> send IDs mapping
}

export interface PersistableMixState {
  mixerTracks: Record<string, PersistableMixerTrack>;
  mixerTrackOrder: string[];
  devices: Record<string, PersistableDevice>;
  sends: Record<string, PersistableSend>;
  trackSends: Record<string, string[]>;
}

export interface MixEngine {
  // Mixer track operations
  createMixerTrack(type: MixerTrack["type"], name?: string): string;
  deleteMixerTrack(id: string): void;
  moveMixerTrack(id: string, newIndex: number): void;

  // Mixer track controls
  setSolo(mixerTrackId: string, solo: boolean): void;
  setMute(mixerTrackId: string, mute: boolean): void;
  setVolume(mixerTrackId: string, volume: number): void;
  setPan(mixerTrackId: string, pan: number): void;
  getMeterValues(mixerTrackId: string): number | number[];

  // Device management
  addDevice(mixerTrackId: string, deviceType: DeviceType): string;
  updateDevice<T extends EffectOptions | ProcessorOptions | InstrumentOptions>(
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
