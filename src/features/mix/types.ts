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

export interface MixerChannel {
  id: string;
  name: string;
  type: "audio" | "midi" | "return" | "master";

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  preDevices: ToneEffectType[];
  postDevices: ToneEffectType[];
  sends: Send[];
  meter: Meter;

  // Routing
  output: {
    type: "master" | "track" | "return";
    targetId?: string;
  };
}

export interface PersistableMixerChannel {
  id: string;
  name: string;
  type: "audio" | "midi" | "return" | "master";
  output: {
    type: "master" | "track" | "return";
    targetId?: string;
  };
}

export interface MixState {
  channels: Record<string, MixerChannel>;
  devices: Record<string, Device>;
  masterChannelId: string;

  // Metering state
  meterData: Record<string, AudioMeterData>;
}

export interface PersistableMixState {
  channels: Record<string, PersistableMixerChannel>;
  devices: Record<string, PersistableDevice>;
  masterChannelId: string;
}

export interface MixEngine {
  createChannel(type: MixerChannel["type"]): string;
  deleteChannel(id: string): void;

  // Device management
  addDevice(channelId: string, deviceType: EffectName): string;
  updateDevice<T extends EffectOptions>(
    channelId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void;
  removeDevice(channelId: string, deviceId: string): void;

  // Sends
  createSend(fromId: string, toId: string): string;
  updateSend(channelId: string, sendId: string, updates: Partial<Send>): void;
  removeSend(channelId: string, sendId: string): void;
  setSendAmount(channelId: string, sendId: string, amount: number): void;

  // Metering
  getMeterData(channelId: string): AudioMeterData;

  // State
  getState(): MixState;
  dispose(): void;
}
