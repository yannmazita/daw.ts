// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import { MixEngine, MixState, MixerChannel, Device, Send } from "../types";
import { EffectName, EffectOptions } from "@/core/types/effect";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { AudioMeterData } from "@/core/types/audio";
import { createChannelNodes, createEffectNode } from "../utils/audioNodes";
import { updateChannel, updateDevice, updateSend } from "../utils/stateUtils";
import {
  disposeChannel,
  disposeDevice,
  disposeSend,
} from "../utils/cleanupUtils";
import { connectChannelChain, connectSend } from "../utils/routingUtils";

export class MixEngineImpl implements MixEngine {
  private disposed = false;
  private meterUpdateInterval: number;

  constructor() {
    this.initializeMasterChannel();
    this.startMeterUpdates();
  }

  private initializeMasterChannel(): void {
    useEngineStore.setState((state) => {
      if (!state.mix.masterChannelId) {
        const id = this.createChannel("master");
        return {
          mix: {
            ...state.mix,
            masterChannelId: id,
          },
        };
      }
      return state;
    });
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
    Object.values(state.mix.channels).forEach((channel) => {
      meterValues.set(channel.id, channel.meter.getValue());
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

  createChannel(type: MixerChannel["type"]): string {
    const id = crypto.randomUUID();
    const nodes = createChannelNodes();

    try {
      // Connect nodes
      nodes.input.connect(nodes.meter);
      nodes.input.connect(nodes.channel);

      const newChannel: MixerChannel = {
        id,
        name: `${type} ${id.slice(0, 4)}`,
        type,
        ...nodes,
        preDevices: [],
        postDevices: [],
        sends: [],
        output: {
          type: type === "master" ? "master" : "master",
        },
      };

      useEngineStore.setState((state) => ({
        mix: updateChannel(state.mix, id, newChannel),
      }));

      return id;
    } catch (error) {
      // Clean up on error
      Object.values(nodes).forEach((node) => node?.dispose());
      throw error;
    }
  }

  deleteChannel(id: string): void {
    const state = useEngineStore.getState();
    const channel = state.mix.channels[id];

    if (!channel || id === state.mix.masterChannelId) {
      throw new Error("Cannot delete channel");
    }

    try {
      disposeChannel(channel);

      useEngineStore.setState((state) => {
        const { [id]: _, ...remainingChannels } = state.mix.channels;
        return {
          mix: {
            ...state.mix,
            channels: remainingChannels,
          },
          arrangement: {
            ...state.arrangement,
            returnTracks: state.arrangement.returnTracks.filter(
              (trackId) => trackId !== id,
            ),
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete channel:", error);
      throw error;
    }
  }

  addDevice(channelId: string, deviceType: EffectName): string {
    const id = crypto.randomUUID();
    const state = useEngineStore.getState();
    const channel = state.mix.channels[channelId];

    if (!channel) throw new Error("Channel not found");

    try {
      const node = createEffectNode(deviceType);
      const device: Device = {
        id,
        type: deviceType,
        name: deviceType,
        bypass: false,
        node,
      };

      useEngineStore.setState((state) => {
        const updatedState = updateDevice(state.mix, id, device);
        return {
          mix: updateChannel(updatedState, channelId, {
            preDevices: [...channel.preDevices, node],
          }),
        };
      });

      // Reconnect channel chain
      connectChannelChain(
        useEngineStore.getState().mix.channels[channelId],
        this.getTargetInput(channelId),
      );

      return id;
    } catch (error) {
      console.error("Failed to add device:", error);
      throw error;
    }
  }

  removeDevice(channelId: string, deviceId: string): void {
    const state = useEngineStore.getState();
    const device = state.mix.devices[deviceId];
    const channel = state.mix.channels[channelId];

    if (!device || !channel) return;

    try {
      disposeDevice(device);

      useEngineStore.setState((state) => {
        const { [deviceId]: _, ...remainingDevices } = state.mix.devices;
        return {
          mix: {
            ...state.mix,
            devices: remainingDevices,
            channels: {
              ...state.mix.channels,
              [channelId]: {
                ...channel,
                preDevices: channel.preDevices.filter((d) => d !== device.node),
                postDevices: channel.postDevices.filter(
                  (d) => d !== device.node,
                ),
              },
            },
          },
        };
      });

      connectChannelChain(
        useEngineStore.getState().mix.channels[channelId],
        this.getTargetInput(channelId),
      );
    } catch (error) {
      console.error("Failed to remove device:", error);
      throw error;
    }
  }

  updateDevice<T extends EffectOptions>(
    channelId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void {
    const state = useEngineStore.getState();
    const device = state.mix.devices[deviceId];
    const channel = state.mix.channels[channelId];

    if (!device || !channel) {
      throw new Error("Device or channel not found");
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
    const state = useEngineStore.getState();
    const sourceChannel = state.mix.channels[fromId];
    const targetChannel = state.mix.channels[toId];

    if (!sourceChannel || !targetChannel) {
      throw new Error("Source or target channel not found");
    }

    const isValidTarget =
      state.arrangement.returnTracks.includes(toId) ||
      toId === state.mix.masterChannelId;

    if (!isValidTarget) {
      throw new Error("Can only send to return or master channels");
    }

    try {
      const gain = new Tone.Gain(0);
      gain.connect(targetChannel.input);

      const send: Send = {
        id,
        name: `Send to ${targetChannel.name}`,
        returnTrackId: toId,
        preFader: false,
        gain,
      };

      useEngineStore.setState((state) => ({
        mix: updateChannel(state.mix, fromId, {
          sends: [...sourceChannel.sends, send],
        }),
      }));

      return id;
    } catch (error) {
      console.error("Failed to create send:", error);
      throw error;
    }
  }

  updateSend(channelId: string, sendId: string, updates: Partial<Send>): void {
    const state = useEngineStore.getState();
    const channel = state.mix.channels[channelId];
    const send = channel?.sends.find((s) => s.id === sendId);

    if (!channel || !send) {
      throw new Error("Channel or send not found");
    }

    try {
      if (updates.returnTrackId) {
        const targetChannel = state.mix.channels[updates.returnTrackId];
        if (!targetChannel) throw new Error("Target channel not found");

        send.gain.disconnect();
        send.gain.connect(targetChannel.input);
      }

      if (updates.preFader !== undefined) {
        connectSend(
          { ...send, preFader: updates.preFader },
          channel,
          state.mix.channels[send.returnTrackId].input,
        );
      }

      if (updates.gain?.gain.value !== undefined) {
        send.gain.gain.value = updates.gain.gain.value;
      }

      useEngineStore.setState((state) => ({
        mix: updateSend(state.mix, channelId, sendId, updates),
      }));
    } catch (error) {
      console.error("Failed to update send:", error);
      throw error;
    }
  }

  removeSend(channelId: string, sendId: string): void {
    const state = useEngineStore.getState();
    const channel = state.mix.channels[channelId];
    const send = channel?.sends.find((s) => s.id === sendId);

    if (!channel || !send) {
      throw new Error("Channel or send not found");
    }

    try {
      disposeSend(send);

      useEngineStore.setState((state) => ({
        mix: updateChannel(state.mix, channelId, {
          sends: channel.sends.filter((s) => s.id !== sendId),
        }),
      }));
    } catch (error) {
      console.error("Failed to remove send:", error);
      throw error;
    }
  }

  setSendAmount(channelId: string, sendId: string, amount: number): void {
    const state = useEngineStore.getState();
    const channel = state.mix.channels[channelId];
    const send = channel?.sends.find((s) => s.id === sendId);

    if (!channel || !send) {
      throw new Error("Channel or send not found");
    }

    try {
      const clampedAmount = Math.max(0, Math.min(1, amount));
      send.gain.gain.value = clampedAmount;

      useEngineStore.setState((state) => ({
        mix: updateSend(state.mix, channelId, sendId, { gain: send.gain }),
      }));
    } catch (error) {
      console.error("Failed to set send amount:", error);
      throw error;
    }
  }

  private getTargetInput(channelId: string): Tone.ToneAudioNode | undefined {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[channelId];

    if (channel.type === "master") return undefined;

    const targetChannel = channel.output.targetId
      ? state.channels[channel.output.targetId]
      : state.channels[state.masterChannelId];

    return targetChannel?.input;
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
      // Dispose all channels and their devices
      Object.values(state.mix.channels).forEach((channel) => {
        disposeChannel(channel);
      });

      // Reset state
      useEngineStore.setState({
        mix: {
          channels: {},
          devices: {},
          masterChannelId: "",
          meterData: {},
        },
      });
    } catch (error) {
      console.error("Error during engine disposal:", error);
      throw error;
    }
  }
}
