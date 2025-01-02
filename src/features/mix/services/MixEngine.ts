// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import { MixEngine, MixState, Device, Send, MixerTrack } from "../types";
import { EffectName, EffectOptions } from "@/core/types/audio";
import { useEngineStore } from "@/core/stores/useEngineStore";
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
import { moveMixerTrackInOrder } from "../utils/orderUtils";
import { initialMixerTrackControlState } from "../utils/initialState";

export class MixEngineImpl implements MixEngine {
  private disposed = false;

  constructor() {
    this.initializeMixerTracks();
  }

  private initializeMixerTracks(): void {
    const stateSnapshot = useEngineStore.getState().mix;
    console.log("Initializing mixer tracks:", stateSnapshot.mixerTracks);

    try {
      if (stateSnapshot.mixerTracks.master) {
        // We have a persisted master track, reinitialize its nodes
        console.log("Reinitializing persisted master track");
        const nodes = createMixerTrackNodes();

        // Connect nodes
        nodes.input.connect(nodes.meter);
        nodes.input.connect(nodes.channel);

        // Update state with new nodes
        useEngineStore.setState((state) => ({
          mix: {
            ...state.mix,
            mixerTracks: {
              ...state.mix.mixerTracks,
              master: {
                ...state.mix.mixerTracks.master,
                ...nodes,
                deviceIds: state.mix.mixerTracks.master.deviceIds,
                controls: state.mix.mixerTracks.master.controls,
              },
            },
          },
        }));
      } else {
        // No persisted master track, create new one
        console.log("Creating new master track");
        this.createMixerTrack("master", "Master Track");
      }

      // Verify master track is now properly initialized
      const masterTrack = useEngineStore.getState().mix.mixerTracks.master;
      if (!masterTrack?.input) {
        throw new Error("Master track initialization failed");
      }
    } catch (error) {
      console.error("Failed to initialize mixer tracks:", error);
      throw error;
    }
  }

  createMixerTrack(type: MixerTrack["type"] = "return", name?: string): string {
    console.log("Creating mixer track:", type);
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
        name: name ?? `${type} ${id.slice(0, 6)}`,
        type,
        ...nodes,
        deviceIds: { pre: [], post: [] },
        controls: { ...initialMixerTrackControlState },
      };

      useEngineStore.setState((state) => ({
        mix: updateMixerTrack(state.mix, id, newMixerTrack),
        mixerTrackOrder:
          type === "master"
            ? state.mix.mixerTrackOrder
            : [...state.mix.mixerTrackOrder, id],
      }));
      return id;
    } catch (error) {
      console.error("Failed to create mixer track:", error);
      // Clean up on error
      Object.values(nodes).forEach((node) => node?.dispose());
      throw error;
    }
  }

  deleteMixerTrack(id: string): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[id];
    const devices = stateSnapshot.devices;

    if (!mixerTrack || id === "master") {
      throw new Error("Could not delete mixer track");
    }

    try {
      disposeMixerTrack(mixerTrack, devices);

      useEngineStore.setState((state) => {
        const { [id]: _, ...remainingMixerTracks } = state.mix.mixerTracks;
        return {
          mix: {
            ...state.mix,
            mixerTracks: remainingMixerTracks,
            mixerTrackOrder: state.mix.mixerTrackOrder.filter(
              (trackId) => trackId !== id,
            ),
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete mixer track:", error);
      throw error;
    }
  }

  moveMixerTrack(trackId: string, newIndex: number): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[trackId];

    if (!mixerTrack) {
      throw new Error("Mixer track not found");
    }

    try {
      const newOrder = moveMixerTrackInOrder(trackId, newIndex, stateSnapshot);
      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          mixerTrackOrder: newOrder,
        },
      }));
    } catch (error) {
      console.error(`Failed to move mixer track ${trackId}:`, error);
      throw error;
    }
  }

  setSolo(mixerTrackId: string, solo: boolean): void {}

  setMute(mixerTrackId: string, mute: boolean): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[mixerTrackId];

    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }

    try {
      mixerTrack.channel.mute = mute;

      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          mixerTracks: {
            ...state.mix.mixerTracks,
            [mixerTrackId]: {
              ...mixerTrack,
              controls: {
                ...mixerTrack.controls,
                mute,
              },
            },
          },
        },
      }));
    } catch (error) {
      console.error(
        `Failed to set mute state for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  setPan(mixerTrackId: string, pan: number): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[mixerTrackId];

    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }

    const clampedPan = Math.max(-1, Math.min(1, pan));

    try {
      mixerTrack.channel.pan.value = clampedPan;

      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          mixerTracks: {
            ...state.mix.mixerTracks,
            [mixerTrackId]: {
              ...mixerTrack,
              controls: {
                ...mixerTrack.controls,
                pan: clampedPan,
              },
            },
          },
        },
      }));
    } catch (error) {
      console.error(
        `Failed to set pan for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  setVolume(mixerTrackId: string, volume: number): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[mixerTrackId];
    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }
    const clampedVolume = Math.max(-100, Math.min(6, volume));
    try {
      mixerTrack.channel.volume.value = clampedVolume;
      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          mixerTracks: {
            ...state.mix.mixerTracks,
            [mixerTrackId]: {
              ...mixerTrack,
              controls: {
                ...mixerTrack.controls,
                volume: clampedVolume,
              },
            },
          },
        },
      }));
    } catch (error) {
      console.error(
        `Failed to set volume for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  getMeterValues(mixerTrackId: string): number | number[] {
    const stateSnapshot = useEngineStore.getState().mix;
    const mixerTrack = stateSnapshot.mixerTracks[mixerTrackId];
    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }
    return mixerTrack.meter.getValue();
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
            deviceIds: {
              ...mixerTrack.deviceIds,
              pre: [...mixerTrack.deviceIds.pre, id],
            },
          }),
        };

        // Get updated track reference
        const updatedTrack = newState.mix.mixerTracks[mixerTrackId];

        // Connect with master track reference
        connectMixerTrackChain(updatedTrack, masterTrack, state.mix.devices);

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
    const stateSnapshot = useEngineStore.getState().mix;
    const devices = stateSnapshot.devices;
    const mixerTrack = stateSnapshot.mixerTracks[mixerTrackId];
    const masterTrack = stateSnapshot.mixerTracks.master;

    if (!devices[deviceId]) {
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
                deviceIds: {
                  pre: mixerTrack.deviceIds.pre.filter((id) => id !== deviceId),
                  post: mixerTrack.deviceIds.post.filter(
                    (id) => id !== deviceId,
                  ),
                },
              },
            },
          },
        };

        // Get updated track reference
        const updatedTrack = newState.mix.mixerTracks[mixerTrackId];

        // Reconnect the chain within setState
        connectMixerTrackChain(updatedTrack, masterTrack, devices);

        return newState;
      });

      // Dispose device after state update
      try {
        disposeDevice(devices[deviceId]);
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
        connectMixerTrackChain(mixerTrack, masterTrack, devices);
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
    const mixStateSnapshot = useEngineStore.getState().mix;
    const compositionStateSnapshot = useEngineStore.getState().composition;
    const sourceTrack = compositionStateSnapshot.tracks[fromId];
    const returnTrack = mixStateSnapshot.mixerTracks[toId];

    if (!sourceTrack) {
      throw new Error(`Source track ${fromId} not found`);
    } else if (!returnTrack) {
      throw new Error(`Return track ${toId} not found`);
    }

    const validation = validateSendRouting(
      fromId,
      toId,
      compositionStateSnapshot.tracks,
      mixStateSnapshot.mixerTracks,
      mixStateSnapshot.sends,
      mixStateSnapshot.trackSends,
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
    baseTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): void {
    const mixStateSnapshot = useEngineStore.getState().mix;
    const compositionStateSnapshot = useEngineStore.getState().composition;
    const send = mixStateSnapshot.sends[sendId];
    const sourceTrack = compositionStateSnapshot.tracks[baseTrackId];
    const masterTrack = mixStateSnapshot.mixerTracks.master;

    if (!send || !sourceTrack || !masterTrack) {
      throw new Error("Send, source track, or master track not found");
    }

    const validation = validateSendUpdate(
      send,
      sourceTrack,
      mixStateSnapshot.mixerTracks,
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
          mixStateSnapshot.mixerTracks[updatedSend.returnTrackId];

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

  removeSend(baseTrackId: string, sendId: string): void {
    const stateSnapshot = useEngineStore.getState().mix;
    const send = stateSnapshot.sends[sendId];
    const sourceTrack = stateSnapshot.mixerTracks[baseTrackId];

    if (!send || !sourceTrack) {
      throw new Error("Send or source track not found");
    }

    if (send.sourceTrackId !== baseTrackId) {
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

  setSendAmount(baseTrackId: string, sendId: string, amount: number): void {
    const mixStateSnapshot = useEngineStore.getState().mix;
    const compositionStateSnapshot = useEngineStore.getState().composition;
    const send = mixStateSnapshot.sends[sendId];
    const sourceTrack = compositionStateSnapshot.tracks[baseTrackId];
    const masterTrack = mixStateSnapshot.mixerTracks.master;

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

  getTrackSends(baseTrackId: string): Send[] {
    const stateSnapshot = useEngineStore.getState().mix;
    const sendIds = stateSnapshot.trackSends[baseTrackId] || [];
    return sendIds.map((id) => stateSnapshot.sends[id]).filter(Boolean);
  }

  disconnectTrackSends(baseTrackId: string): void {
    const sends = this.getTrackSends(baseTrackId);

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

  getState(): MixState {
    return useEngineStore.getState().mix;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    const stateSnapshot = useEngineStore.getState().mix;
    const devices = stateSnapshot.devices;

    try {
      // Dispose all mixer tracks and their devices
      Object.values(stateSnapshot.mixerTracks).forEach((mixerTrack) => {
        disposeMixerTrack(mixerTrack, devices);
      });

      // Reset state
      useEngineStore.setState({
        mix: {
          mixerTracks: {},
          mixerTrackOrder: ["master"],
          devices: {},
          sends: {},
          trackSends: {},
        },
      });
    } catch (error) {
      console.error("Error during engine disposal:", error);
      throw error;
    }
  }
}
