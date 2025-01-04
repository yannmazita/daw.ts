// src/core/types/processor.ts
import * as Tone from "tone";
import { Frequency, Decibels } from "tone/build/esm/core/type/Units";

/**
 * Effect options for Tone.EQ3.
 * Not exported by tonejs.
 */
export interface EQ3Options extends Tone.ToneAudioNodeOptions {
  low: Decibels;
  mid: Decibels;
  high: Decibels;
  lowFrequency: Frequency;
  highFrequency: Frequency;
}

export type ProcessorOptions =
  | Tone.CompressorOptions
  | EQ3Options
  | Tone.GateOptions;

/**
 *  Represents the types of audio processors available, as defined by the Tone.js library.
 */
export type ToneProcessorType = Tone.Compressor | Tone.EQ3 | Tone.Gate;

export enum ProcessorName {
  /** A compressor effect that reduces the dynamic range of the signal. */
  Compressor = "Compressor",

  /** A three-band EQ with low, mid, and high controls. */
  EQ3 = "EQ3",

  /** A gate effect that cuts off the signal when it falls below a threshold. */
  Gate = "Gate",
}
