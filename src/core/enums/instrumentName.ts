// src/core/enums/instrumentName.ts

/**
 * Enumerates the names of various synthesizer instruments supported by the application.
 * These names are used to reference specific types of synthesizers provided by the Tone.js library.
 */
export enum InstrumentName {
  /** A basic synthesizer. */
  Synth = "Synth",

  /** An amplitude modulation synthesizer. */
  AMSynth = "AMSynth",

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
}
