// src/core/types/effect.ts

import * as Tone from "tone";

/**
 * Represents the types of audio effects available, as defined by the Tone.js library.
 * This type is used to manage instances of effects that can be assigned to mixer channels.
 */
export type Effect =
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
