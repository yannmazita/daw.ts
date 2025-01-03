// src/core/types/audio.ts
import { ToneEffectType } from "./effect";
import { ToneInstrumentType } from "./instrument";
import { ToneProcessorType } from "./processor";
import * as Tone from "tone";

export type DeviceType = "effect" | "processor" | "instrument" | "soundChain";

export interface Device<T = any> {
  id: string;
  type: DeviceType;
  name: string;
  bypass: boolean;
  node:
    | ToneEffectType
    | ToneInstrumentType
    | ToneProcessorType
    | Tone.ToneAudioNode;
  options?: T;
}
