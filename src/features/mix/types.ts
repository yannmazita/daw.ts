// src/features/mix/types.ts
import { Channel, Gain, Meter, Param, ToneAudioNode } from "tone";
import { AudioMeterData } from "../../core/types/audio";

export interface DeviceParameter {
  id: string;
  name: string;
  value: number;
  param: Param<any>;
  range: [number, number];
  defaultValue: number;
}

export interface Device {
  id: string;
  type: string; // Maps to Tone.js effect types
  name: string;
  bypass: boolean;
  node: ToneAudioNode;
  parameters: Record<string, DeviceParameter>;
}

export interface PersistableDevice {
  id: string;
  type: string;
  name: string;
  bypass: boolean;
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
  addDevice(channelId: string, deviceType: string): string;
  removeDevice(channelId: string, deviceId: string): void;
  setDeviceParameter(
    channelId: string,
    deviceId: string,
    paramId: string,
    value: number,
  ): void;

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
