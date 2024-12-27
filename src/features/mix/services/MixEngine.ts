// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import { MixEngine, MixState, Device, Send, MixerTrack } from "../types";
import { EffectName, EffectOptions } from "@/core/types/effect";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { AudioMeterData } from "@/core/types/audio";
import { createMixerTrackNodes, createEffectNode } from "../utils/audioNodes";
import { updateDevice, updateMixerTrack, updateSend } from "../utils/stateUtils";
import {
  disposeDevice,
  disposeMixerTrack,
  disposeSend,
} from "../utils/cleanupUtils";
import { connectMixerTrackChain, connectSend } from "../utils/routingUtils";

export class MixEngineImpl implements MixEngine {
  private disposed = false;
  private meterUpdateInterval: number;

  constructor() {
    this.initializeMixerTracks();
    //this.startMeterUpdates();
  }

  private initializeMixerTracks(): void {
    const stateSnapshot = useEngineStore.getState();
    const mixerTracks = stateSnapshot.mix.mixerTracks;
      if (!mixerTracks) {
        this.createMixerTrack("master");
        this.createMixerTrack("return");
        this.createMixerTrack("return");
    };
  }

  private startMeterUpdates(): void {
    this.meterUpdateInterval = window.setInterval(
      () => this.updateMeters(),
      100,
    );
  }

  private updateMeters(): void {
    const meterValues = new Map<string, number | number[]>();
    const state = useEngineStore.getState();

    // Gather meter values
    Object.values(state.mix.mixerTracks).forEach((mixerTrack) => {
      meterValues.set(mixerTrack.id, mixerTrack.meter.getValue());
    });

    // Update state atomically
    useEngineStore.setState((state) => ({
      mix: {
        ...state.mix,
        meterData: Object.fromEntries(
          Array.from(meterValues.entries()).map(([id, values]) => [
            id,
            {
              peak: Array.isArray(values) ? values : [values, values],
              rms: Array.isArray(values)
                ? values.map((v) => v * 0.7)
                : [values * 0.7, values * 0.7],
            },
          ]),
        ),
      },
    }));
  }

  createMixerTrack(type: MixerTrack["type"]): string {
    let id = null;
    type === "master" ? (id = "master") : (id = crypto.randomUUID());
    const nodes = createMixerTrackNodes();

    try {
      // Connect nodes
      nodes.input.connect(nodes.meter);
      nodes.input.connect(nodes.channel);

      const newMixerTrack: MixerTrack = {
        id,
        name: `${type} ${id.slice(0, 4)}`,
        type,
        ...nodes,
        preDevices: [],
        postDevices: [],
        sends: [],
      };

      useEngineStore.setState((state) => ({
        mix: updateMixerTrack(state.mix, id, newMixerTrack),
      }));

      return id;
    } catch (error) {
      // Clean up on error
      Object.values(nodes).forEach((node) => node?.dispose());
      throw error;
    }
  }

  deleteMixerTrack(id: string): void {
    const stateSnapshot = useEngineStore.getState();
    const mixerTrack = stateSnapshot.mix.mixerTracks[id];

    if (!mixerTrack || id === "master") {
      throw new Error("Could not delete mixer track");
    }

    try {
      disposeMixerTrack(mixerTrack);

      useEngineStore.setState((state) => {
        const { [id]: _, ...remainingMixerTracks } = state.mix.mixerTracks;
        return {
          mix: {
            ...state.mix,
            mixerTracks: remainingMixerTracks,
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete mixer track:", error);
      throw error;
    }
  }

addDevice(mixerTrackId: string, deviceType: EffectName): string {
  const id = crypto.randomUUID();
  const stateSnapshot = useEngineStore.getState();
  const mixerTrack = stateSnapshot.mix.mixerTracks[mixerTrackId];
  const masterTrack = stateSnapshot.mix.mixerTracks["master"];

  if (!mixerTrack) {
    throw new Error(`Mixer track ${mixerTrackId} not found`);
  }

  if (!masterTrack) {
    throw new Error("Master track not found");
  }

    const node = createEffectNode(deviceType);
  try {
    const device: Device = {
      id,
      type: deviceType,
      name: deviceType,
      bypass: false,
      node,
    };

    useEngineStore.setState((state) => {
      const updatedState = updateDevice(state.mix, id, device);
      const newState = {
        mix: updateMixerTrack(updatedState, mixerTrackId, {
          preDevices: [...mixerTrack.preDevices, node],
        }),
      };

      // Get updated track reference
      const updatedTrack = newState.mix.mixerTracks[mixerTrackId];
      
      // Connect with master track reference
      connectMixerTrackChain(updatedTrack, masterTrack);

      return newState;
    });

    return id;
  } catch (error) {
    console.error(`Failed to add ${deviceType} device to track ${mixerTrackId}:`, error);
    try {
      node.dispose();
    } catch (cleanupError) {
      console.warn("Failed to clean up device node:", cleanupError);
    }
    throw error;
  }
}

removeDevice(mixerTrackId: string, deviceId: string): void {
  const stateSnapshot = useEngineStore.getState();
  const device = stateSnapshot.mix.devices[deviceId];
  const mixerTrack = stateSnapshot.mix.mixerTracks[mixerTrackId];
  const masterTrack = stateSnapshot.mix.mixerTracks["master"];

  if (!device) {
    throw new Error(`Device ${deviceId} not found`);
  }
  if (!mixerTrack) {
    throw new Error(`Mixer track ${mixerTrackId} not found`);
  }
  if (!masterTrack) {
    throw new Error("Master track not found");
  }

  try {
    // Update state first to ensure consistency
    useEngineStore.setState((state) => {
      // Remove device from state
      const { [deviceId]: removedDevice, ...remainingDevices } = state.mix.devices;

      // Create new state with updated track
      const newState = {
        mix: {
          ...state.mix,
          devices: remainingDevices,
          mixerTracks: {
            ...state.mix.mixerTracks,
            [mixerTrackId]: {
              ...mixerTrack,
              preDevices: mixerTrack.preDevices.filter(
                (d) => d !== device.node
              ),
              postDevices: mixerTrack.postDevices.filter(
                (d) => d !== device.node
              ),
            },
          },
        },
      };

      // Get updated track reference
      const updatedTrack = newState.mix.mixerTracks[mixerTrackId];
      
      // Reconnect the chain within setState
      connectMixerTrackChain(updatedTrack, masterTrack);

      return newState;
    });

    // Dispose device after state update
    try {
      disposeDevice(device);
    } catch (disposeError) {
      console.warn(`Failed to dispose device ${deviceId}:`, disposeError);
      // Continue execution as state is already updated
    }
  } catch (error) {
    console.error(`Failed to remove device ${deviceId} from track ${mixerTrackId}:`, error);
    // Attempt to restore connection if state update failed
    try {
      connectMixerTrackChain(mixerTrack, masterTrack);
    } catch (restoreError) {
      console.error("Failed to restore track connection:", restoreError);
    }
    throw error;
  }
}

  updateDevice<T extends EffectOptions>(
    mixerTrackId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void {
    const stateSnapshot = useEngineStore.getState();
    const device = stateSnapshot.mix.devices[deviceId];
    const mixerTrack = stateSnapshot.mix.mixerTracks[mixerTrackId];

    if (!device || !mixerTrack) {
      throw new Error("Device or mixer track not found");
    }

    try {
      // Update bypass state
      if (updates.bypass !== undefined) {
        device.node.wet.value = updates.bypass ? 0 : 1;
      }

      // Update other parameters
      if (updates.options) {
        Object.entries(updates.options).forEach(([key, value]) => {
          const param = device.node[key as keyof typeof device.node];
          if (param instanceof Tone.Param) {
            param.value = value;
          } else if (key in device.node) {
            (device.node as any)[key] = value;
          }
        });
      }

      useEngineStore.setState((state) => ({
        mix: updateDevice(state.mix, deviceId, {
          ...device,
          ...updates,
          node: device.node,
        }),
      }));
    } catch (error) {
      console.error("Failed to update device:", error);
      throw error;
    }
  }

  createSend(fromId: string, toId: string): string {
    const id = crypto.randomUUID();
    const stateSnapshot = useEngineStore.getState();
    const sourceMixerTrack = stateSnapshot.mix.mixerTracks[fromId];
    const targetMixerTrack = stateSnapshot.mix.mixerTracks[toId];

    if (!sourceMixerTrack || !targetMixerTrack) {
      throw new Error("Source or target track not found");
    }

    try {
      const gain = new Tone.Gain(0);
      gain.connect(targetMixerTrack.input);

      const send: Send = {
        id,
        name: `Send to ${targetMixerTrack.name}`,
        returnTrackId: toId,
        preFader: false,
        gain,
      };

      useEngineStore.setState((state) => ({
        mix: updateMixerTrack(state.mix, fromId, {
          sends: [...sourceMixerTrack.sends, send],
        }),
      }));

      return id;
    } catch (error) {
      console.error("Failed to create send:", error);
      throw error;
    }
  }

updateSend(mixerTrackId: string, sendId: string, updates: Partial<Send>): void {
  const state = useEngineStore.getState();
  const mixerTrack = state.mix.mixerTracks[mixerTrackId];
  const send = mixerTrack?.sends.find((s) => s.id === sendId);
  const masterTrack = state.mix.mixerTracks["master"];

  // Validate resources
  if (!mixerTrack) {
    throw new Error(`Mixer track ${mixerTrackId} not found`);
  }
  if (!send) {
    throw new Error(`Send ${sendId} not found in track ${mixerTrackId}`);
  }
  if (!masterTrack) {
    throw new Error("Master track not found");
  }

  try {
    // Validate return track if being updated
    if (updates.returnTrackId) {
      const targetTrack = state.mix.mixerTracks[updates.returnTrackId];
      if (!targetTrack) {
        throw new Error(`Target return track ${updates.returnTrackId} not found`);
      }
      if (targetTrack.type !== "return") {
        throw new Error(`Track ${updates.returnTrackId} is not a return track`);
      }
    }

    // Update state and audio atomically
    useEngineStore.setState((state) => {
      // Create updated send object
      const updatedSend = {
        ...send,
        ...updates,
        // Preserve gain node if not updating
        gain: updates.gain || send.gain,
      };

      // Get target return track
      const returnTrack = state.mix.mixerTracks[updatedSend.returnTrackId];
      if (!returnTrack) {
        throw new Error(`Return track ${updatedSend.returnTrackId} not found`);
      }

      try {
        // Update audio routing
        if (updates.returnTrackId || updates.preFader !== undefined) {
          connectSend(updatedSend, mixerTrack, returnTrack);
        }

        // Update gain if specified
        if (updates.gain?.gain.value !== undefined) {
          updatedSend.gain.gain.value = updates.gain.gain.value;
        }

        // Update state
        return {
          mix: updateSend(state.mix, mixerTrackId, sendId, updatedSend),
        };
      } catch (audioError) {
        // If audio update fails, try to restore original routing
        try {
          connectSend(send, mixerTrack, returnTrack);
        } catch (restoreError) {
          console.error("Failed to restore send routing:", restoreError);
        }
        throw audioError;
      }
    });
  } catch (error) {
    console.error(
      `Failed to update send ${sendId} on track ${mixerTrackId}:`,
      error
    );
    throw error;
  }
}

  removeSend(mixerTrackId: string, sendId: string): void {
    const state = useEngineStore.getState();
    const channel = state.mix.mixerTracks[mixerTrackId];
    const send = channel?.sends.find((s) => s.id === sendId);

    if (!channel || !send) {
      throw new Error("Mixer track or send not found");
    }

    try {
      disposeSend(send);

      useEngineStore.setState((state) => ({
        mix: updateMixerTrack(state.mix, mixerTrackId, {
          sends: channel.sends.filter((s) => s.id !== sendId),
        }),
      }));
    } catch (error) {
      console.error("Failed to remove send:", error);
      throw error;
    }
  }

  setSendAmount(mixerTrackId: string, sendId: string, amount: number): void {
    const state = useEngineStore.getState();
    const channel = state.mix.mixerTracks[mixerTrackId];
    const send = channel?.sends.find((s) => s.id === sendId);

    if (!channel || !send) {
      throw new Error("Channel or send not found");
    }

    try {
      const clampedAmount = Math.max(0, Math.min(1, amount));
      send.gain.gain.value = clampedAmount;

      useEngineStore.setState((state) => ({
        mix: updateSend(state.mix, mixerTrackId, sendId, { gain: send.gain }),
      }));
    } catch (error) {
      console.error("Failed to set send amount:", error);
      throw error;
    }
  }

  getMeterData(channelId: string): AudioMeterData {
    const state = useEngineStore.getState().mix;
    return state.meterData[channelId] || { peak: [0, 0], rms: [0, 0] };
  }

  getState(): MixState {
    return useEngineStore.getState().mix;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    clearInterval(this.meterUpdateInterval);
    const state = useEngineStore.getState();

    try {
      // Dispose all mixer tracks and their devices
      Object.values(state.mix.mixerTracks).forEach((mixerTrack) => {
        disposeMixerTrack(mixerTrack);
      });

      // Reset state
      useEngineStore.setState({
        mix: {
          mixerTracks: {},
          devices: {},
          meterData: {},
        },
      });
    } catch (error) {
      console.error("Error during engine disposal:", error);
      throw error;
    }
  }
}
