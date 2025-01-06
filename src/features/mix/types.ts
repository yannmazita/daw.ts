// src/features/mix/types.ts
import { EffectOptions } from "../../core/types/effect";
import { Channel, Gain, Meter } from "tone";
import { InstrumentOptions } from "@/core/types/instrument";
import { ProcessorOptions } from "@/core/types/processor";
import { ToneAudioNode } from "tone";
import { EngineState } from "@/core/stores/useEngineStore";

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
  createMixerTrack(
    state: MixState,
    type: MixerTrack["type"],
    name?: string,
  ): MixState;
  deleteMixerTrack(state: MixState, id: string): MixState;
  moveMixerTrack(state: MixState, id: string, newIndex: number): MixState;

  // Mixer track controls
  setSolo(state: MixState, mixerTrackId: string, solo: boolean): MixState;
  setMute(state: MixState, mixerTrackId: string, mute: boolean): MixState;
  setVolume(state: MixState, mixerTrackId: string, volume: number): MixState;
  setPan(state: MixState, mixerTrackId: string, pan: number): MixState;
  getMeterValues(state: MixState, mixerTrackId: string): number | number[];

  // Device management
  addDevice(
    state: MixState,
    parentId: string,
    deviceType: DeviceType,
  ): MixState;
  updateDevice(
    state: MixState,
    parentId: string,
    deviceId: string,
    updates: Partial<Device>,
  ): MixState;
  removeDevice(state: MixState, parentId: string, deviceId: string): MixState;

  // Sends
  createSend(state: EngineState, fromId: string, toId: string): EngineState;
  updateSend(
    state: EngineState,
    baseTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): EngineState;
  removeSend(state: MixState, baseTrackId: string, sendId: string): MixState;
  setSendAmount(
    state: EngineState,
    baseTrackId: string,
    sendId: string,
    amount: number,
  ): EngineState;
  getTrackSends(state: MixState, baseTrackId: string): Send[];
  disconnectTrackSends(state: MixState, baseTrackId: string): MixState;

  // Sound Chains
  createSoundChain(state: MixState, name?: string): MixState;

  // Cleanup
  dispose(state: MixState): MixState;
}
