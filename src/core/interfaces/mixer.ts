// src/core/interfaces/mixer.ts

import * as Tone from "tone";
import {
  AudioNode,
  Identifiable,
  AudioProcessor,
  AnalysisNode,
  Disposable,
} from "../interfaces/base";
import { EffectName, EffectOptions, ToneEffectType } from "../types/effect";
import { NormalRange } from "tone/build/esm/core/type/Units";

// Analysis/Metering
export interface MeterData {
  values: number | number[];
}

export interface Meter extends AnalysisNode {
  data: MeterData;
}

// Effects
export interface Effect<T extends EffectOptions = EffectOptions>
  extends AudioProcessor {
  id: string;
  type: EffectName;
  options: T;
  node: ToneEffectType;
}

// Sends
export interface Send extends Identifiable {
  targetId: string;
  gain: NormalRange;
  node: Tone.Gain;
}

// Channel
export interface MixerChannel extends Identifiable, AudioNode, Disposable {
  effects: Effect[];
  sends: Send[];
  meter: Meter | null;
  channel: Tone.Channel;
}

// Serializable state
export type SerializableEffect = Omit<Effect, "node">;
export type SerializableSend = Omit<Send, "node">;
export type SerializableChannel = Omit<MixerChannel, "channel" | "dispose">;

export interface MixerState {
  master: SerializableChannel;
  channels: SerializableChannel[];
}

// Actions interface
export interface MixerActions {
  // Channel Management
  createChannel(name: string): string;
  removeChannel(id: string): void;
  updateChannel(id: string, updates: Partial<SerializableChannel>): void;

  // Effect Management
  addEffect: <T extends EffectOptions>(
    channelId: string,
    type: EffectName,
    options?: Partial<T>,
  ) => string;

  removeEffect(channelId: string, effectId: string): void;

  updateEffect: <T extends EffectOptions>(
    channelId: string,
    effectId: string,
    updates: Partial<T>,
  ) => void;

  bypassEffect(channelId: string, effectId: string, bypass: boolean): void;

  // Send Management
  createSend(fromId: string, toId: string, gain?: NormalRange): string;

  removeSend(channelId: string, sendId: string): void;

  updateSend(channelId: string, sendId: string, gain: NormalRange): void;

  // Metering
  enableMetering(channelId: string): void;
  disableMetering(channelId: string): void;
  getMeterData(channelId: string): MeterData | null;
  updateMeterConfig(
    channelId: string,
    config: Partial<Omit<Meter, "data">>,
  ): void;

  // Audio Routing
  getInputNode(channelId: string): Tone.ToneAudioNode;
  getOutputNode(channelId: string): Tone.ToneAudioNode;
}

// Root interface combining state and actions
export interface Mixer extends Disposable {
  state: MixerState;
  actions: MixerActions;
}
