// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import { MixEngine, MixState, Device, Send, MixerTrack } from "../types";
import { EffectName, EffectOptions } from "@/core/types/effect";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { AudioMeterData } from "@/core/types/audio";
import { createMixerTrackNodes, createEffectNode } from "../utils/audioNodes";
import {
  addSendToState,
  removeSendFromState,
  updateDevice,
  updateMixerTrack,
} from "../utils/stateUtils";
import {
  disposeDevice,
  disposeMixerTrack,
  disposeSend,
} from "../utils/cleanupUtils";
import {
  calculateMasterLevel,
  captureRoutingState,
  connectMixerTrackChain,
  connectSend,
  restoreSendRouting,
} from "../utils/routingUtils";
import { validateSendRouting, validateSendUpdate } from "../utils/validation";

export class MixEngineImpl implements MixEngine {
  private disposed = false;

  constructor() {
    this.initializeMixerTracks();
  }

  private initializeMixerTracks(): void {
    const stateSnapshot = useEngineStore.getState();
    const mixerTracks = stateSnapshot.mix.mixerTracks;
    if (!mixerTracks) {
      this.createMixerTrack("master");
      this.createMixerTrack("return");
      this.createMixerTrack("return");
    }
  }

  createMixerTrack(type: MixerTrack["type"]): string {
    let id = null;
    if (type === "master") {
      id = "master";
    } else {
      id = crypto.randomUUID();
    }
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
    const masterTrack = stateSnapshot.mix.mixerTracks.master;

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
      console.error(
        `Failed to add ${deviceType} device to track ${mixerTrackId}:`,
        error,
      );
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
    const masterTrack = stateSnapshot.mix.mixerTracks.master;

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
        const { [deviceId]: _, ...remainingDevices } = state.mix.devices;

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
                  (d) => d !== device.node,
                ),
                postDevices: mixerTrack.postDevices.filter(
                  (d) => d !== device.node,
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
      console.error(
        `Failed to remove device ${deviceId} from track ${mixerTrackId}:`,
        error,
      );
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
    const stateSnapshot = useEngineStore.getState().mix;
    const sourceTrack = stateSnapshot.mixerTracks[fromId];
    const returnTrack = stateSnapshot.mixerTracks[toId];

    if (!sourceTrack || !returnTrack) {
      throw new Error("Source or target track not found");
    }

    const validation = validateSendRouting(
      fromId,
      toId,
      stateSnapshot.mixerTracks,
      stateSnapshot.sends,
      stateSnapshot.trackSends,
    );

    if (!validation.isValid) {
      throw new Error(`Invalid send routing: ${validation.error}`);
    }

    try {
      const send: Send = {
        id,
        name: `Send to ${returnTrack.name}`,
        sourceTrackId: fromId,
        returnTrackId: toId,
        preFader: false,
        gain: new Tone.Gain(0),
      };

      // Connect the send before updating state
      connectSend(send, sourceTrack, returnTrack);

      useEngineStore.setState((state) => ({
        mix: addSendToState(state.mix, send),
      }));

      return id;
    } catch (error) {
      console.error("Failed to create send:", error);
      throw error;
    }
  }

  updateSend(
    mixerTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const send = stateSnapshot.sends[sendId];
    const sourceTrack = stateSnapshot.mixerTracks[mixerTrackId];
    const masterTrack = stateSnapshot.mixerTracks.master;

    if (!send || !sourceTrack || !masterTrack) {
      throw new Error("Send, source track, or master track not found");
    }

    const validation = validateSendUpdate(
      send,
      sourceTrack,
      stateSnapshot.mixerTracks,
      updates,
    );
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const originalState = captureRoutingState(send, sourceTrack);

    try {
      useEngineStore.setState((state) => {
        const updatedSend = {
          ...send,
          ...updates,
          gain: updates.gain ?? send.gain,
        };
        const returnTrack =
          stateSnapshot.mixerTracks[updatedSend.returnTrackId];

        try {
          // Handle any routing changes
          if (updates.returnTrackId || updates.preFader !== undefined) {
            connectSend(updatedSend, sourceTrack, returnTrack);

            // Update master level for post-fader changes
            if (!updatedSend.preFader) {
              sourceTrack.channel.volume.value = calculateMasterLevel(
                updatedSend.gain.gain.value,
                updatedSend.preFader,
              );
            }
          }

          return {
            mix: {
              ...state.mix,
              sends: {
                ...state.mix.sends,
                [sendId]: updatedSend,
              },
            },
          };
        } catch (audioError) {
          restoreSendRouting(send, sourceTrack, returnTrack, originalState);
          throw audioError;
        }
      });
    } catch (error) {
      console.error(`Failed to update send ${sendId}:`, error);
      throw error;
    }
  }

  removeSend(mixerTrackId: string, sendId: string): void {
    const state = useEngineStore.getState().mix;
    const send = state.sends[sendId];
    const sourceTrack = state.mixerTracks[mixerTrackId];

    if (!send || !sourceTrack) {
      throw new Error("Send or source track not found");
    }

    if (send.sourceTrackId !== mixerTrackId) {
      throw new Error("Send doesn't belong to specified track");
    }

    try {
      // If it was post-fader, restore master level
      if (!send.preFader) {
        sourceTrack.channel.volume.value = 1;
      }

      // Dispose audio nodes
      disposeSend(send);

      // Update state
      useEngineStore.setState((state) => ({
        mix: removeSendFromState(state.mix, sendId),
      }));
    } catch (error) {
      console.error(`Failed to remove send ${sendId}:`, error);
      throw error;
    }
  }

  setSendAmount(mixerTrackId: string, sendId: string, amount: number): void {
    const state = useEngineStore.getState().mix;
    const send = state.sends[sendId];
    const sourceTrack = state.mixerTracks[mixerTrackId];
    const masterTrack = state.mixerTracks.master;

    if (!send || !sourceTrack || !masterTrack) {
      throw new Error("Send, source track, or master track not found");
    }

    try {
      const clampedAmount = Math.max(0, Math.min(1, amount));
      const masterAmount = calculateMasterLevel(clampedAmount, send.preFader);

      // Update send gain
      send.gain.gain.value = clampedAmount;
      sourceTrack.channel.volume.value = masterAmount;

      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          sends: {
            ...state.mix.sends,
            [sendId]: send,
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set send amount:", error);
      throw error;
    }
  }

  getTrackSends(trackId: string): Send[] {
    const state = useEngineStore.getState().mix;
    const sendIds = state.trackSends[trackId] || [];
    return sendIds.map((id) => state.sends[id]).filter(Boolean);
  }

  disconnectTrackSends(trackId: string): void {
    const sends = this.getTrackSends(trackId);

    sends.forEach((send) => {
      try {
        send.gain.disconnect();
        useEngineStore.setState((state) => ({
          mix: removeSendFromState(state.mix, send.id),
        }));
      } catch (error) {
        console.warn(`Failed to disconnect send ${send.id}:`, error);
      }
    });
  }

  getMeterData(mixerTrackId: string): AudioMeterData {
    const state = useEngineStore.getState().mix;
    return state.meterData[mixerTrackId] || { peak: [0, 0], rms: [0, 0] };
  }

  getState(): MixState {
    return useEngineStore.getState().mix;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

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
          sends: {},
          trackSends: {},
          meterData: {},
        },
      });
    } catch (error) {
      console.error("Error during engine disposal:", error);
      throw error;
    }
  }
}
