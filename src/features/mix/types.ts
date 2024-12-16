// src/features/mix/types.ts
import { EffectName, ParameterDefinition } from "../../core/types/effect";
import { Channel, Gain, Meter, Param, ToneAudioNode } from "tone";
import { AudioMeterData } from "../../core/types/audio";

export interface DeviceParameter {
  id: string;
  value: number;
  param: Param<any>;
  definition: ParameterDefinition;
}

export interface Device {
  id: string;
  type: EffectName;
  name: string;
  bypass: boolean;
  node: ToneAudioNode;
  parameters: Record<string, DeviceParameter>;
}

export interface PersistableDevice {
  id: string;
  type: EffectName;
  name: string;
  bypass: boolean;
  parameters: Record<string, DeviceParameter>;
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
  preDevices: ToneAudioNode[];
  postDevices: ToneAudioNode[];
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
  returnTracks: string[];
  masterChannelId: string;

  // Metering state
  meterData: Record<string, AudioMeterData>;
}

export interface PersistableMixState {
  channels: Record<string, PersistableMixerChannel>;
  devices: Record<string, PersistableDevice>;
  returnTracks: string[];
  masterChannelId: string;
}

export interface MixEngine {
  createChannel(type: MixerChannel["type"]): string;
  deleteChannel(id: string): void;

  // Device management
  addDevice(channelId: string, deviceType: EffectName): string;
  removeDevice(channelId: string, deviceId: string): void;
  setDeviceParameter(deviceId: string, paramId: string, value: number): void;
  getDeviceParameters(deviceId: string): Record<string, ParameterDefinition>;
  getParameterValue(deviceId: string, paramId: string): number;

  // Sends
  createSend(fromId: string, toId: string): string;
  removeSend(channelId: string, sendId: string): void;
  setSendAmount(channelId: string, sendId: string, amount: number): void;

  // Metering
  getMeterData(channelId: string): AudioMeterData;

  // State
  getState(): MixState;
  dispose(): void;
}
