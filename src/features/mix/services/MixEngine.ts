// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import {
  MixEngine,
  MixState,
  Send,
  MixerTrack,
  Device,
  SoundChain,
  DeviceType,
} from "../types";
import {
  createMixerTrackNodes,
  createDeviceNode,
} from "@/common/utils/audioNodes";
import {
  addSendToState,
  removeSendFromState,
  updateDevice,
  updateMixerTrack,
  updateMixState,
  updateSoundChain,
} from "../utils/stateUtils";
import {
  disposeDevice,
  disposeMixerTrack,
  disposeSend,
  disposeSoundChain,
} from "../utils/cleanupUtils";
import {
  calculateMasterLevel,
  captureRoutingState,
  connectMixerTrackChain,
  connectSend,
  connectSoundChain,
  restoreSendRouting,
} from "../utils/routingUtils";
import { validateSendRouting, validateSendUpdate } from "../utils/validation";
import { moveMixerTrackInOrder } from "../utils/orderUtils";
import { initialMixerTrackControlState } from "../utils/initialState";
import { ToneWithBypass } from "@/core/types/audio";
import { EngineState } from "@/core/stores/useEngineStore";

export class MixEngineImpl implements MixEngine {
  private disposed = false;

  constructor(state: MixState) {
    this.initializeMixerTracks(state);
  }

  initializeMixerTracks(state: MixState): MixState {
    console.log("Initializing mixer tracks:", state.mixerTracks);

    try {
      if (state.mixerTracks.master) {
        // We have a persisted master track, reinitialize its nodes
        console.log("Reinitializing persisted master track");
        const nodes = createMixerTrackNodes();

        // Connect nodes
        nodes.input.connect(nodes.meter);
        nodes.input.connect(nodes.channel);

        // Update state with new nodes
        return updateMixState(state, {
          mixerTracks: {
            ...state.mixerTracks,
            master: {
              ...state.mixerTracks.master,
              ...nodes,
              deviceIds: state.mixerTracks.master.deviceIds,
              controls: state.mixerTracks.master.controls,
            },
          },
        });
      } else {
        // No persisted master track, create new one
        console.log("Creating new master track");
        return this.createMixerTrack(state, "master", "Master Track");
      }
    } catch (error) {
      console.error("Failed to initialize mixer tracks:", error);
      throw error;
    }
  }

  createMixerTrack(
    state: MixState,
    type: MixerTrack["type"] = "return",
    name?: string,
  ): MixState {
    let id = null;
    if (type === "master") {
      id = "master";
    } else {
      id = crypto.randomUUID();
    }
    const nodes = createMixerTrackNodes();

    try {
      nodes.input.connect(nodes.meter);
      nodes.input.connect(nodes.channel);
    } catch (error) {
      console.error("Failed to connect mixer track nodes");
      throw error;
    }

    const newMixerTrack: MixerTrack = {
      id,
      name: name ?? `${type} ${id.slice(0, 6)}`,
      type,
      ...nodes,
      deviceIds: [],
      controls: { ...initialMixerTrackControlState },
    };

    try {
      return updateMixState(state, {
        mixerTracks: {
          ...state.mixerTracks,
          [id]: newMixerTrack,
        },
        mixerTrackOrder:
          type === "master"
            ? state.mixerTrackOrder
            : [...state.mixerTrackOrder, id],
      });
    } catch (error) {
      console.error("Failed to create mixer track");
      throw error;
    }
  }

  deleteMixerTrack(state: MixState, id: string): MixState {
    const mixerTrack = state.mixerTracks[id];
    const devices = state.devices;

    if (!mixerTrack || id === "master") {
      throw new Error("Could not delete mixer track");
    }

    try {
      disposeMixerTrack(mixerTrack, devices);
      const { [id]: _, ...remainingMixerTracks } = state.mixerTracks;
      return updateMixState(state, {
        mixerTracks: remainingMixerTracks,
        mixerTrackOrder: state.mixerTrackOrder.filter(
          (trackId) => trackId !== id,
        ),
      });
    } catch (error) {
      console.error("Failed to delete mixer track:", error);
      throw error;
    }
  }

  moveMixerTrack(state: MixState, trackId: string, newIndex: number): MixState {
    const mixerTrack = state.mixerTracks[trackId];

    if (!mixerTrack) {
      throw new Error("Mixer track not found");
    }

    try {
      const newOrder = moveMixerTrackInOrder(trackId, newIndex, state);
      return updateMixState(state, {
        mixerTrackOrder: newOrder,
      });
    } catch (error) {
      console.error(`Failed to move mixer track ${trackId}:`, error);
      throw error;
    }
  }

  setSolo(state: MixState, mixerTrackId: string, solo: boolean): MixState {
    // Placeholder for solo functionality
    return state;
  }

  setMute(state: MixState, mixerTrackId: string, mute: boolean): MixState {
    const mixerTrack = state.mixerTracks[mixerTrackId];

    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }

    try {
      mixerTrack.channel.mute = mute;

      return updateMixState(state, {
        mixerTracks: {
          ...state.mixerTracks,
          [mixerTrackId]: {
            ...mixerTrack,
            controls: {
              ...mixerTrack.controls,
              mute,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        `Failed to set mute state for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  setPan(state: MixState, mixerTrackId: string, pan: number): MixState {
    const mixerTrack = state.mixerTracks[mixerTrackId];

    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }

    const clampedPan = Math.max(-1, Math.min(1, pan));

    try {
      mixerTrack.channel.pan.value = clampedPan;

      return updateMixState(state, {
        mixerTracks: {
          ...state.mixerTracks,
          [mixerTrackId]: {
            ...mixerTrack,
            controls: {
              ...mixerTrack.controls,
              pan: clampedPan,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        `Failed to set pan for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  setVolume(state: MixState, mixerTrackId: string, volume: number): MixState {
    const mixerTrack = state.mixerTracks[mixerTrackId];
    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }
    const clampedVolume = Math.max(-100, Math.min(6, volume));
    try {
      mixerTrack.channel.volume.value = clampedVolume;
      return updateMixState(state, {
        mixerTracks: {
          ...state.mixerTracks,
          [mixerTrackId]: {
            ...mixerTrack,
            controls: {
              ...mixerTrack.controls,
              volume: clampedVolume,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        `Failed to set volume for mixer track ${mixerTrackId}:`,
        error,
      );
      throw error;
    }
  }

  getMeterValues(state: MixState, mixerTrackId: string): number | number[] {
    const mixerTrack = state.mixerTracks[mixerTrackId];
    if (!mixerTrack) {
      throw new Error(`Mixer track ${mixerTrackId} not found`);
    }
    return mixerTrack.meter.getValue();
  }

  addDevice(
    state: MixState,
    parentId: string,
    deviceType: DeviceType,
  ): MixState {
    const id = crypto.randomUUID();
    const mixerTrack = state.mixerTracks[parentId];
    const soundChain = state.soundChains[parentId];
    const masterTrack = state.mixerTracks.master;

    if (!mixerTrack && !soundChain) {
      throw new Error(`Mixer track or sound chain ${parentId} not found`);
    }

    const node = createDeviceNode(deviceType);
    try {
      const device: Device = {
        id,
        type: deviceType,
        name: deviceType,
        bypass: false,
        node,
        parentId,
      };

      const updatedState = updateDevice(state, id, device);
      let newState = { mix: updatedState };
      if (mixerTrack) {
        newState = {
          mix: updateMixerTrack(updatedState, parentId, {
            deviceIds: [...(mixerTrack?.deviceIds || []), id],
          }),
        };
      } else if (soundChain) {
        newState = {
          mix: updateSoundChain(updatedState, parentId, {
            deviceIds: [...(soundChain?.deviceIds || []), id],
          }),
        };
      }

      // Get updated track reference
      const updatedTrack = newState.mix.mixerTracks[parentId];
      const updatedDevices = newState.mix.devices;
      // Connect with master track reference
      if (updatedTrack) {
        connectMixerTrackChain(updatedTrack, masterTrack, updatedDevices);
      } else if (soundChain) {
        connectSoundChain(soundChain, updatedDevices);
      }

      return { ...state, ...newState };
    } catch (error) {
      console.error(`Failed to add ${deviceType} device to track ${parentId}`);
      throw error;
    }
  }

  removeDevice(state: MixState, parentId: string, deviceId: string): MixState {
    const devices = state.devices;
    const mixerTrack = state.mixerTracks[parentId];
    const soundChain = state.soundChains[parentId];
    const masterTrack = state.mixerTracks.master;

    if (!devices[deviceId]) {
      throw new Error(`Device ${deviceId} not found`);
    }
    if (!mixerTrack && !soundChain) {
      throw new Error(`Mixer track or sound chain ${parentId} not found`);
    }
    if (mixerTrack && !masterTrack) {
      throw new Error("Master track not found");
    }

    try {
      // Remove device from state
      const { [deviceId]: _, ...remainingDevices } = state.devices;

      let newState = {
        ...state,
        devices: remainingDevices,
      };
      if (mixerTrack) {
        newState = {
          ...state,
          devices: remainingDevices,
          mixerTracks: {
            ...state.mixerTracks,
            [parentId]: {
              ...mixerTrack,
              deviceIds: mixerTrack.deviceIds.filter((id) => id !== deviceId),
            },
          },
        };
      } else if (soundChain) {
        newState = {
          ...state,
          devices: remainingDevices,
          soundChains: {
            ...state.soundChains,
            [parentId]: {
              ...soundChain,
              deviceIds: soundChain.deviceIds.filter((id) => id !== deviceId),
            },
          },
        };
      }

      // Get updated track reference
      const updatedTrack = newState.mixerTracks[parentId];
      const updatedDevices = newState.devices;

      // Reconnect the chain within setState with master track reference
      if (updatedTrack) {
        connectMixerTrackChain(updatedTrack, masterTrack, updatedDevices);
      } else if (soundChain) {
        connectSoundChain(soundChain, updatedDevices);
      }

      // Dispose device after state update
      try {
        disposeDevice(devices[deviceId]);
      } catch (disposeError) {
        console.warn(`Failed to dispose device ${deviceId}:`, disposeError);
        // Continue execution as state is already updated
      }

      return { ...state, ...newState };
    } catch (error) {
      console.error(
        `Failed to remove device ${deviceId} from track ${parentId}:`,
        error,
      );
      // Attempt to restore connection if state update failed
      try {
        if (mixerTrack) {
          connectMixerTrackChain(mixerTrack, masterTrack, devices);
        } else if (soundChain) {
          connectSoundChain(soundChain, devices);
        }
      } catch (restoreError) {
        console.error("Failed to restore track connection:", restoreError);
      }
      throw error;
    }
  }

  updateDevice(
    state: MixState,
    parentId: string,
    deviceId: string,
    updates: Partial<Device>,
  ): MixState {
    const device = state.devices[deviceId];
    const mixerTrack = state.mixerTracks[parentId];
    const soundChain = state.soundChains[parentId];

    if (!device || (!mixerTrack && !soundChain)) {
      throw new Error("Device or mixer track/soundchain not found");
    }

    try {
      // Update bypass state
      if (
        updates.bypass !== undefined &&
        (device.node as ToneWithBypass).bypass
      ) {
        (device.node as ToneWithBypass).bypass(updates.bypass);
      }

      // Update other parameters
      if (updates.options) {
        Object.entries(updates.options).forEach(([key, value]) => {
          if (
            device.node[key as keyof typeof device.node] instanceof Tone.Param
          ) {
            (
              device.node[key as keyof typeof device.node] as Tone.Param<any>
            ).value = value;
          } else if (key in device.node) {
            (device.node as any)[key] = value;
          }
        });
      }

      return updateDevice(state, deviceId, {
        ...device,
        ...updates,
        node: device.node,
      });
    } catch (error) {
      console.error("Failed to update device:", error);
      throw error;
    }
  }

  createSend(state: EngineState, fromId: string, toId: string): EngineState {
    const id = crypto.randomUUID();
    const sourceTrack = state.composition.tracks[fromId];
    const returnTrack = state.mix.mixerTracks[toId];

    if (!sourceTrack) {
      throw new Error(`Source track ${fromId} not found`);
    } else if (!returnTrack) {
      throw new Error(`Return track ${toId} not found`);
    }

    const validation = validateSendRouting(
      fromId,
      toId,
      state.composition.tracks,
      state.mix.mixerTracks,
      state.mix.sends,
      state.mix.trackSends,
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

      return {
        ...state,
        mix: addSendToState(state.mix, send),
      };
    } catch (error) {
      console.error("Failed to create send:", error);
      throw error;
    }
  }

  updateSend(
    state: EngineState,
    baseTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): EngineState {
    const send = state.mix.sends[sendId];
    const sourceTrack = state.composition.tracks[baseTrackId];
    const masterTrack = state.mix.mixerTracks.master;

    if (!send || !sourceTrack || !masterTrack) {
      throw new Error("Send, source track, or master track not found");
    }

    const validation = validateSendUpdate(
      send,
      sourceTrack,
      state.mix.mixerTracks,
      updates,
    );
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const originalState = captureRoutingState(send, sourceTrack);

    try {
      const updatedSend = {
        ...send,
        ...updates,
        gain: updates.gain ?? send.gain,
      };
      const returnTrack = state.mix.mixerTracks[updatedSend.returnTrackId];

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
          ...state,
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
    } catch (error) {
      console.error(`Failed to update send ${sendId}:`, error);
      throw error;
    }
  }

  removeSend(state: MixState, baseTrackId: string, sendId: string): MixState {
    const send = state.sends[sendId];
    const sourceTrack = state.mixerTracks[baseTrackId];

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
      return removeSendFromState(state, sendId);
    } catch (error) {
      console.error(`Failed to remove send ${sendId}:`, error);
      throw error;
    }
  }

  setSendAmount(
    state: EngineState,
    baseTrackId: string,
    sendId: string,
    amount: number,
  ): EngineState {
    const send = state.mix.sends[sendId];
    const sourceTrack = state.composition.tracks[baseTrackId];
    const masterTrack = state.mix.mixerTracks.master;

    if (!send || !sourceTrack || !masterTrack) {
      throw new Error("Send, source track, or master track not found");
    }

    try {
      const clampedAmount = Math.max(0, Math.min(1, amount));
      const masterAmount = calculateMasterLevel(clampedAmount, send.preFader);

      // Update send gain
      send.gain.gain.value = clampedAmount;
      sourceTrack.channel.volume.value = masterAmount;

      return {
        ...state,
        mix: {
          ...state.mix,
          sends: {
            ...state.mix.sends,
            [sendId]: send,
          },
        },
      };
    } catch (error) {
      console.error("Failed to set send amount:", error);
      throw error;
    }
  }

  getTrackSends(state: MixState, baseTrackId: string): Send[] {
    const sendIds = state.trackSends[baseTrackId] || [];
    return sendIds.map((id) => state.sends[id]).filter(Boolean);
  }

  disconnectTrackSends(state: MixState, baseTrackId: string): MixState {
    const sends = this.getTrackSends(state, baseTrackId);
    let newState = state;

    sends.forEach((send) => {
      try {
        send.gain.disconnect();
        newState = removeSendFromState(newState, send.id);
      } catch (error) {
        console.warn(`Failed to disconnect send ${send.id}:`, error);
      }
    });
    return newState;
  }

  createSoundChain(state: MixState, name?: string): MixState {
    const id = crypto.randomUUID();
    const input = new Tone.Gain();
    const output = new Tone.Gain();

    try {
      const soundChain: SoundChain = {
        id,
        name: name ?? `Sound Chain ${id.slice(0, 6)}`,
        deviceIds: [],
        input,
        output,
      };

      return updateMixState(state, {
        soundChains: {
          ...state.soundChains,
          [id]: soundChain,
        },
      });
    } catch (error) {
      console.error("Failed to create sound chain");
      // Clean up on error
      input.dispose();
      output.dispose();
      throw error;
    }
  }

  dispose(state: MixState): MixState {
    if (this.disposed) return state;
    this.disposed = true;

    const devices = state.devices;
    const soundChains = state.soundChains;

    try {
      // Dispose all mixer tracks and their devices
      Object.values(state.mixerTracks).forEach((mixerTrack) => {
        disposeMixerTrack(mixerTrack, devices);
      });
      Object.values(soundChains).forEach((soundChain) => {
        disposeSoundChain(soundChain, devices);
      });

      // Reset state
      return {
        mixerTracks: {},
        mixerTrackOrder: ["master"],
        devices: {},
        sends: {},
        trackSends: {},
        soundChains: {},
      };
    } catch (error) {
      console.error("Error during engine disposal");
      throw error;
    }
  }
}
