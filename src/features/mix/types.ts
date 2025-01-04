// src/features/mix/types.ts
import { EffectOptions } from "../../core/types/effect";
import { Channel, Gain, Meter } from "tone";
import { InstrumentOptions } from "@/core/types/instrument";
import { ProcessorOptions } from "@/core/types/processor";
import { ToneAudioNode } from "tone";

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

export type DeviceType = "effect" | "processor" | "instrument" | "soundChain";

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
  node: ToneAudioNode;
  options?: T;
  parentId: string; // ID of the mixer track or sound chain that owns this device
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
  parentId: string; // ID of the mixer track or sound chain that owns this device
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
  deviceIds: string[];
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

export interface SoundChain {
  id: string;
  name: string;
  deviceIds: string[]; // IDs of devices within the sound chain
  input: Gain;
  output: Gain;
}

export interface PersistableSoundChain {
  id: string;
  name: string;
  deviceIds: string[];
  inputGainValue: number;
  outputGainValue: number;
}

export interface MixState {
  mixerTracks: Record<string, MixerTrack>;
  mixerTrackOrder: string[];
  devices: Record<string, Device>;
  soundChains: Record<string, SoundChain>;
  sends: Record<string, Send>;
  trackSends: Record<string, string[]>; // track id -> send IDs mapping
}

export interface PersistableMixState {
  mixerTracks: Record<string, PersistableMixerTrack>;
  mixerTrackOrder: string[];
  devices: Record<string, PersistableDevice>;
  soundChains: Record<string, PersistableSoundChain>;
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
  updateDevice(
    parentId: string,
    deviceId: string,
    updates: Partial<Device>,
  ): void;
  removeDevice(mixerTrackId: string, deviceId: string): void;

  // Sends
  createSend(fromId: string, toId: string): string;
  updateSend(baseTrackId: string, sendId: string, updates: Partial<Send>): void;
  removeSend(baseTrackId: string, sendId: string): void;
  setSendAmount(baseTrackId: string, sendId: string, amount: number): void;
  getTrackSends(baseTrackId: string): Send[];
  disconnectTrackSends(baseTrackId: string): void;

  // Sound Chains
  createSoundChain(name?: string): string;

  // State
  getState(): MixState;
  dispose(): void;
}
