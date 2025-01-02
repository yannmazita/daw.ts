// src/features/soundChain/services/SoundChainEngine.ts
import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { createInstrumentNode } from "../utils/instrumentNodes";
import { EngineState, useEngineStore } from "@/core/stores/useEngineStore";
import { SoundChainEngine, SoundChain } from "../types";
import {
  EffectName,
  EffectOptions,
  ToneEffectType,
} from "@/core/types/devices/effects";
import { createEffectNode } from "@/features/mix/utils/audioNodes";
import {
  SoundChainDevice,
  SoundChainEffect,
} from "@/core/types/devices/soundChain";

export class SoundChainEngineImpl implements SoundChainEngine {
  private disposed = false;

  createSoundChain(name?: string): string {
    this.checkDisposed();
    const id = crypto.randomUUID();

    try {
      const newSoundChain: SoundChain = {
        id,
        name: name ?? `Sound Chain ${id.slice(0, 6)}`,
        devices: [],
        parameters: {},
      };

      useEngineStore.setState((state) => ({
        soundChain: {
          ...state.soundChain,
          soundChains: {
            ...state.soundChain.soundChains,
            [id]: newSoundChain,
          },
        },
      }));
      return id;
    } catch (error) {
      console.error("Failed to create sound chain:", error);
      throw error;
    }
  }

  updateSoundChain(id: string, updates: Partial<SoundChain>): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().soundChain;
    const soundChain = stateSnapshot.soundChains[id];
    if (!soundChain) {
      throw new Error(`Sound Chain not found`);
    }
    try {
      useEngineStore.setState((state) => ({
        soundChain: {
          ...state.soundChain,
          soundChains: {
            ...state.soundChain.soundChains,
            [id]: {
              ...soundChain,
              ...updates,
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to update sound chain:", error);
      throw error;
    }
  }

  deleteSoundChain(id: string): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().soundChain;
    if (!stateSnapshot.soundChains[id]) {
      throw new Error(`Sound Chain not found`);
    }
    try {
      useEngineStore.setState((state) => {
        const { [id]: _, ...remainingSoundChains } =
          state.soundChain.soundChains;
        return {
          soundChain: {
            ...state.soundChain,
            soundChains: remainingSoundChains,
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete sound chain:", error);
      throw error;
    }
  }

  addDevice(
    soundChainId: string,
    type: InstrumentName | EffectName,
    options?: InstrumentOptions | EffectOptions,
  ): string {
    this.checkDisposed();
    const id = crypto.randomUUID();
    const stateSnapshot = useEngineStore.getState().soundChain;
    const soundChain = stateSnapshot.soundChains[soundChainId];
    if (!soundChain) {
      throw new Error(`Sound Chain not found`);
    }
    try {
      let node;
      if (Object.values(InstrumentName).includes(type as InstrumentName)) {
        node = createInstrumentNode(
          type as InstrumentName,
          options as InstrumentOptions,
        );
      } else if (Object.values(EffectName).includes(type as EffectName)) {
        node = createEffectNode(type as EffectName, options as EffectOptions);
      } else {
        throw new Error(`Invalid device type: ${type}`);
      }
      const newDevice: SoundChainDevice | SoundChainEffect = {
        id,
        type,
        name: type as string,
        bypass: false,
        node: node as ToneEffectType,
        options,
      };
      useEngineStore.setState((state) => ({
        soundChain: {
          ...state.soundChain,
          soundChains: {
            ...state.soundChain.soundChains,
            [soundChainId]: {
              ...soundChain,
              devices: [...soundChain.devices, newDevice],
            },
          },
        },
      }));
      return id;
    } catch (error) {
      console.error("Failed to add device to sound chain:", error);
      throw error;
    }
  }

  removeDevice(soundChainId: string, deviceId: string): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().soundChain;
    const soundChain = stateSnapshot.soundChains[soundChainId];
    if (!soundChain) {
      throw new Error(`Sound Chain not found`);
    }
    try {
      useEngineStore.setState((state) => ({
        soundChain: {
          ...state.soundChain,
          soundChains: {
            ...state.soundChain.soundChains,
            [soundChainId]: {
              ...soundChain,
              devices: soundChain.devices.filter(
                (device) => device.id !== deviceId,
              ),
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to remove device from sound chain:", error);
      throw error;
    }
  }

  updateDevice<T extends InstrumentOptions | EffectOptions>(
    soundChainId: string,
    deviceId: string,
    updates: Partial<SoundChainDevice<T> | SoundChainEffect<T>>,
  ): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().soundChain;
    const soundChain = stateSnapshot.soundChains[soundChainId];
    if (!soundChain) {
      throw new Error(`Sound Chain not found`);
    }
    try {
      useEngineStore.setState((state: EngineState) => ({
        soundChain: {
          ...state.soundChain,
          soundChains: {
            ...state.soundChain.soundChains,
            [soundChainId]: {
              ...soundChain,
              devices: soundChain.devices.map((device) => {
                if (device.id === deviceId) {
                  return {
                    ...device,
                    ...updates,
                  };
                }
                return device;
              }),
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to update device in sound chain:", error);
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("Sound Chain Engine is disposed");
    }
  }

  getState() {
    return useEngineStore.getState().soundChain;
  }

  dispose(): void {
    this.disposed = true;
  }
}
