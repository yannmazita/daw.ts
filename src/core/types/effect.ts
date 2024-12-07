// src/core/types/effect.ts

import * as Tone from "tone";
import { Frequency, NormalRange, Time } from "tone/build/esm/core/type/Units";

/**
 * Represents the types of audio effects available, as defined by the Tone.js library.
 */
export type ToneEffectType =
  | Tone.AutoFilter
  | Tone.AutoPanner
  | Tone.AutoWah
  | Tone.BitCrusher
  | Tone.Chebyshev
  | Tone.Chorus
  | Tone.Distortion
  | Tone.FeedbackDelay
  | Tone.Freeverb
  | Tone.FrequencyShifter
  | Tone.JCReverb
  | Tone.Phaser
  | Tone.PingPongDelay
  | Tone.PitchShift
  | Tone.Reverb
  | Tone.StereoWidener
  | Tone.Tremolo;

/**
 * Effect options for Tone.Feedbackdelay.
 * Not exported by tonejs.
 */
export interface FeedbackDelayOptions extends Tone.ToneAudioNodeOptions {
  delayTime?: Time;
  maxDelay?: number;
  feedback?: NormalRange;
  wet?: NormalRange;
}

/**
 * Effect options for Tone.FrequencyShifter.
 * Not exported by tonejs.
 */
export interface FrequencyShifterOptions extends Tone.ToneAudioNodeOptions {
  frequency?: Frequency;
  wet?: NormalRange;
}

/**
 * Effect options for Tone.ReverbOptions.
 * Not exported by tonejs.
 */
export interface ReverbOptions extends Tone.ToneAudioNodeOptions {
  decay?: number;
  preDelay?: number;
  wet?: number;
}

export type EffectOptions =
  | Tone.AutoFilterOptions
  | Tone.AutoPannerOptions
  | Tone.AutoWahOptions
  | Tone.BitCrusherOptions
  | Tone.ChebyshevOptions
  | Tone.ChorusOptions
  | Tone.DistortionOptions
  | FeedbackDelayOptions
  | Tone.FreeverbOptions
  | FrequencyShifterOptions
  | Tone.JCReverbOptions
  | Tone.PhaserOptions
  | Tone.PingPongDelayOptions
  | Tone.PitchShiftOptions
  | ReverbOptions
  | Tone.StereoWidenerOptions
  | Tone.TremoloOptions;

export enum EffectName {
  /** An auto-filter effect that sweeps a frequency band with an LFO. */
  AutoFilter = "Auto Filter",

  /** An auto-panning effect that modulates the stereo panning position. */
  AutoPanner = "Auto Panner",

  /** An auto-wah effect that modulates the filter's cutoff frequency. */
  AutoWah = "Auto-wah",

  /** A bit crusher effect that reduces the resolution of the audio signal. */
  BitCrusher = "Bit Crusher",

  /** A Chebyshev distortion effect with rich harmonic distortion. */
  Chebyshev = "Chebyshev",

  /** A chorus effect that thickens the sound by adding delayed copies of the signal. */
  Chorus = "Chorus",

  /** A distortion effect that adds harmonic distortion to the signal. */
  Distortion = "Distortion",

  /** A feedback delay effect that adds echoes with feedback control. */
  FeedbackDelay = "Feedback Delay",

  /** A reverb effect that simulates room acoustics using freeverb. */
  Freeverb = "Freeverb",

  /** A frequency shifter effect that shifts the frequency of the input signal. */
  FrequencyShifter = "Frequency Shifter",

  /** A reverb effect inspired by the JC reverb units. */
  JCReverb = "John Chowning Reverb",

  /** A phaser effect that creates phase-shifting audio oscillations. */
  Phaser = "Phaser",

  /** A ping-pong delay effect that alternates echoes between left and right channels. */
  PingPongDelay = "Ping-Pong Delay",

  /** A pitch-shifting effect that changes the pitch of the input signal. */
  PitchShift = "Pitch Shift",

  /** A classic reverb effect for simulating various acoustic spaces. */
  Reverb = "Reverb",

  /** A stereo widening effect that enhances the stereo field of the audio. */
  StereoWidener = "Stereo Widener",

  /** A tremolo effect that modulates the amplitude of the signal. */
  Tremolo = "Tremolo",

  /** A vibrato effect that modulates the pitch of the signal. */
  Vibrato = "Vibrato",
}

export interface EffectState {
  id: string;
  type: EffectName;
  bypass: boolean;
  options: EffectOptions;
}
