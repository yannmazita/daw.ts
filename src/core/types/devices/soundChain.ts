// src/core/types/devices/soundChain.ts
import { Device } from "./base";
import {
  InstrumentName,
  InstrumentOptions,
  ToneInstrumentType,
} from "../instrument";
import { EffectName, EffectOptions, ToneEffectType } from "./effects";

export interface SoundChainDevice<T extends InstrumentOptions = any>
  extends Device {
  type: InstrumentName;
  node: ToneInstrumentType;
  options?: T;
}

export interface SoundChainEffect<T extends EffectOptions = any>
  extends Device {
  type: EffectName;
  node: ToneEffectType;
  options?: T;
}
