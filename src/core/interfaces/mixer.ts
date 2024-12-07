// src/core/interfaces/mixer.ts
// Audio routing interface

import * as Tone from "tone";
import {
  EffectName,
  EffectState,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
  ToneEffectType,
} from "../types/effect";
import { NormalRange } from "tone/build/esm/core/type/Units";
import { EffectOptions } from "tone/build/esm/effect/Effect";

export interface MixerChannelState {
  id: string;
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: EffectState[];
  sends: {
    id: string;
    targetId: string;
    gain: NormalRange;
  }[];
}

export interface MixerChannel {
  id: string;
  state: MixerChannelState;
  channel: Tone.Channel;
  effects: Map<string, ToneEffectType>;
  sends: Map<string, Tone.Gain>;
}

export interface MixerState {
  master: MixerChannelState;
  channels: MixerChannelState[];
}

export interface MixerActions {
  // Channel Management
  createChannel: (name: string) => string;
  removeChannel: (id: string) => void;
  updateChannel: (id: string, updates: Partial<MixerChannelState>) => void;

  // Effect Management
  addEffect: {
    (
      channelId: string,
      type: EffectName.AutoFilter,
      options?: Tone.AutoFilterOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.AutoPanner,
      options?: Tone.AutoPannerOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.AutoWah,
      options?: Tone.AutoWahOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.BitCrusher,
      options?: Tone.BitCrusherOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Chebyshev,
      options?: Tone.ChebyshevOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Chorus,
      options?: Tone.ChorusOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Distortion,
      options?: Tone.DistortionOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.FeedbackDelay,
      options?: FeedbackDelayOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Freeverb,
      options?: Tone.FreeverbOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.FrequencyShifter,
      options?: FrequencyShifterOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.JCReverb,
      options?: Tone.JCReverbOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Phaser,
      options?: Tone.PhaserOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.PingPongDelay,
      options?: Tone.PingPongDelayOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.PitchShift,
      options?: Tone.PitchShiftOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Reverb,
      options?: ReverbOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.StereoWidener,
      options?: Tone.StereoWidenerOptions,
    ): string;
    (
      channelId: string,
      type: EffectName.Tremolo,
      options?: Tone.TremoloOptions,
    ): string;
  };
  removeEffect: (channelId: string, effectId: string) => void;
  updateEffect: (
    channelId: string,
    effectId: string,
    updates: Partial<EffectOptions>,
  ) => void;
  bypassEffect: (channelId: string, effectId: string, bypass: boolean) => void;

  // Send Management
  createSend: (fromId: string, toId: string, gain?: NormalRange) => string;
  removeSend: (channelId: string, sendId: string) => void;
  updateSend: (channelId: string, sendId: string, gain: NormalRange) => void;

  // Utility
  dispose: () => void;
}

export interface Mixer {
  state: MixerState;
  actions: MixerActions;
  master: Tone.Channel;
  channels: Map<string, MixerChannel>;

  // Audio Processing
  getInputNode: (channelId: string) => Tone.ToneAudioNode;
  getOutputNode: (channelId: string) => Tone.ToneAudioNode;

  // State Management
  toJSON: () => MixerState;
  fromJSON: (state: MixerState) => void;
}
