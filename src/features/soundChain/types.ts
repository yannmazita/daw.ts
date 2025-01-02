// src/features/soundChain/types.ts
import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { EffectName, EffectOptions } from "@/core/types/devices/effects";
import {
  SoundChainDevice,
  SoundChainEffect,
} from "@/core/types/devices/soundChain";

export interface PersistableInstrument {
  id: string;
  name: string;
  type: InstrumentName;
  options?: InstrumentOptions;
}

export interface SoundChain {
  id: string;
  name: string;
  devices: (SoundChainDevice | SoundChainEffect)[];
  parameters: Record<string, any>; // TODO: define parameter type
}

export interface SoundChainState {
  soundChains: Record<string, SoundChain>;
}

export interface PersistableSoundChainState {
  soundChains: Record<string, SoundChain>;
}

export interface SoundChainEngine {
  // Sound Chain operations
  createSoundChain(name?: string): string;
  updateSoundChain(id: string, updates: Partial<SoundChain>): void;
  deleteSoundChain(id: string): void;

  // Device management
  addDevice(
    soundChainId: string,
    type: InstrumentName | EffectName,
    options?: InstrumentOptions | EffectOptions,
  ): string;
  removeDevice(soundChainId: string, deviceId: string): void;
  updateDevice<T extends InstrumentOptions | EffectOptions>(
    soundChainId: string,
    deviceId: string,
    updates: Partial<SoundChainDevice<T> | SoundChainEffect<T>>,
  ): void;

  // State
  getState(): SoundChainState;
  dispose(): void;
}
