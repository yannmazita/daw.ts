// src/core/types/intrument.ts

import * as Tone from "tone";

/**
 * Represents the types of synthesizer instruments available, as defined by the Tone.js library.
 */
export type InstrumentType =
  | Tone.AMSynth
  | Tone.DuoSynth
  | Tone.FMSynth
  | Tone.MembraneSynth
  | Tone.MetalSynth
  | Tone.MonoSynth
  | Tone.NoiseSynth
  | Tone.PluckSynth
  | Tone.Sampler
  | Tone.Synth;

export type InstrumentOptions =
  | Tone.AMSynthOptions
  | Tone.DuoSynthOptions
  | Tone.FMSynthOptions
  | Tone.MembraneSynthOptions
  | Tone.MetalSynthOptions
  | Tone.MonoSynthOptions
  | Tone.NoiseSynthOptions
  | Tone.PluckSynthOptions
  | Tone.SamplerOptions
  | Tone.SynthOptions;

export enum InstrumentName {
  /** A basic synthesizer. */
  Synth = "Synth",

  /** An amplitude modulation synthesizer. */
  AMSynth = "AMSynth",

  /** A synthesizer that produces percussion-like sounds. */
  DuoSynth = "DuoSynth",

  /** A frequency modulation synthesizer. */
  FMSynth = "FMSynth",

  /** A synthesizer that produces percussion-like sounds. */
  MembraneSynth = "MembraneSynth",

  /** A synthesizer for metallic sounds. */
  MetalSynth = "MetalSynth",

  /** A monophonic synthesizer. */
  MonoSynth = "MonoSynth",

  /** A synthesizer that generates noise-based sounds. */
  NoiseSynth = "NoiseSynth",

  /** A synthesizer that generates plucked string sounds. */
  PluckSynth = "PluckSynth",

  /** A sampler instrument. */
  Sampler = "Sampler",
}
