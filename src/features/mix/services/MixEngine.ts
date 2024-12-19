// src/features/mix/services/MixEngine.ts
import * as Tone from "tone";
import { v4 as uuidv4 } from "uuid";
import { MixEngine, MixState, MixerChannel, Device, Send } from "../types";
import {
  EffectName,
  EffectOptions,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
  ToneEffectType,
} from "@/core/types/effect";
import { EngineState, useEngineStore } from "@/core/stores/useEngineStore";
import { AudioMeterData } from "@/core/types/audio";

export class MixEngineImpl implements MixEngine {
  private disposed = false;
  private meterUpdateInterval: number;

  constructor() {
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

    // Start meter updates
    this.meterUpdateInterval = window.setInterval(() => {
      this.updateMeters();
    }, 100);
  }

  private createAudioNodes(): MixerChannel["channel"] {
    return new Tone.Channel().toDestination();
  }

  private updateMeters() {
    // Gather all meter values first
    const meterValues = new Map<string, number[]>();

    useEngineStore.getState().mix.channels.forEach((channel) => {
      meterValues.set(channel.id, channel.meter.getValue());
    });

    // Then update state atomically
    useEngineStore.setState((state) => {
      const meterData = Object.fromEntries(
        Array.from(meterValues.entries()).map(([id, values]) => [
          id,
          {
            peak: Array.isArray(values) ? values : [values, values],
            rms: Array.isArray(values)
              ? values.map((v) => v * 0.7)
              : [values * 0.7, values * 0.7],
          },
        ]),
      );
      return { mix: { ...state.mix, meterData } };
    });
  }

  createChannel(type: MixerChannel["type"]): string {
    const id = uuidv4();
    // Create audio nodes
    const input = new Tone.Gain();
    const channel = this.createAudioNodes();
    const meter = new Tone.Meter();
    try {
      // Connect nodes
      input.connect(meter);
      input.connect(channel);

      useEngineStore.setState((state) => {
        const newChannel: MixerChannel = {
          id,
          name: `${type} ${id.slice(0, 4)}`,
          type,
          input,
          channel,
          preDevices: [],
          postDevices: [],
          sends: [],
          meter,
          output: {
            type: type === "master" ? "master" : "master",
          },
        };

        return {
          mix: {
            ...state.mix,
            channels: {
              ...state.mix.channels,
              [id]: newChannel,
            },
          },
        };
      });

      return id;
    } catch (error) {
      // Clean up any created nodes if state update fails
      input?.dispose();
      channel?.dispose();
      meter?.dispose();
      throw error;
    }
  }

  deleteChannel(id: string): void {
    // First, validate and get channel data outside setState
    const currentState = useEngineStore.getState();
    const channel = currentState.mix.channels[id];

    if (!channel || id === currentState.mix.masterChannelId) {
      throw new Error("Cannot delete channel");
    }

    try {
      // Perform all audio node cleanup outside of setState
      this.cleanupChannelNodes(channel);

      // Then update state atomically
      useEngineStore.setState((state) => {
        const { [id]: removedChannel, ...remainingChannels } =
          state.mix.channels;

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
      console.error("Failed to cleanup channel:", error);
      throw error;
    }
  }

  private cleanupChannelNodes(channel: MixerChannel): void {
    try {
      // Clean up devices
      channel.preDevices.forEach((device) => {
        try {
          device.disconnect();
        } catch (e) {
          console.warn("Failed to disconnect pre-device", e);
        }
      });

      channel.postDevices.forEach((device) => {
        try {
          device.disconnect();
        } catch (e) {
          console.warn("Failed to disconnect post-device", e);
        }
      });

      // Clean up sends
      channel.sends.forEach((send) => {
        try {
          send.gain.dispose();
        } catch (e) {
          console.warn("Failed to dispose send", e);
        }
      });

      // Clean up channel nodes
      try {
        channel.input.dispose();
        channel.channel.dispose();
        channel.meter.dispose();
      } catch (e) {
        console.warn("Failed to dispose channel nodes", e);
      }
    } catch (error) {
      // Log the error but continue with state update
      console.error("Channel cleanup failed:", error);
      throw error;
    }
  }

  private createEffectNode(
    type: EffectName,
    options?: EffectOptions,
  ): ToneEffectType {
    const defaultOptions = { wet: 1, ...options };
    switch (type) {
      case EffectName.AutoFilter:
        return new Tone.AutoFilter(defaultOptions as Tone.AutoFilterOptions);
      case EffectName.AutoPanner:
        return new Tone.AutoPanner(defaultOptions as Tone.AutoPannerOptions);
      case EffectName.AutoWah:
        return new Tone.AutoWah(defaultOptions as Tone.AutoWahOptions);
      case EffectName.BitCrusher:
        return new Tone.BitCrusher(defaultOptions as Tone.BitCrusherOptions);
      case EffectName.Chebyshev:
        return new Tone.Chebyshev(defaultOptions as Tone.ChebyshevOptions);
      case EffectName.Chorus:
        return new Tone.Chorus(defaultOptions as Tone.ChorusOptions);
      case EffectName.Distortion:
        return new Tone.Distortion(defaultOptions as Tone.DistortionOptions);
      case EffectName.FeedbackDelay:
        return new Tone.FeedbackDelay(defaultOptions as FeedbackDelayOptions);
      case EffectName.Freeverb:
        return new Tone.Freeverb(defaultOptions as Tone.FreeverbOptions);
      case EffectName.FrequencyShifter:
        return new Tone.FrequencyShifter(
          defaultOptions as FrequencyShifterOptions,
        );
      case EffectName.JCReverb:
        return new Tone.JCReverb(defaultOptions as Tone.JCReverbOptions);
      case EffectName.Phaser:
        return new Tone.Phaser(defaultOptions as Tone.PhaserOptions);
      case EffectName.PingPongDelay:
        return new Tone.PingPongDelay(
          defaultOptions as Tone.PingPongDelayOptions,
        );
      case EffectName.PitchShift:
        return new Tone.PitchShift(defaultOptions as Tone.PitchShiftOptions);
      case EffectName.Reverb:
        return new Tone.Reverb(defaultOptions as ReverbOptions);
      case EffectName.StereoWidener:
        return new Tone.StereoWidener(
          defaultOptions as Tone.StereoWidenerOptions,
        );
      case EffectName.Tremolo:
        return new Tone.Tremolo(defaultOptions as Tone.TremoloOptions);
      default:
        throw new Error("Unknown effect type");
    }
  }

  addDevice(channelId: string, deviceType: EffectName): string {
    const id = uuidv4();

    // Validate channel exists before any operations
    const currentState = useEngineStore.getState();
    const channel = currentState.mix.channels[channelId];
    if (!channel) throw new Error("Channel not found");

    try {
      // Create audio nodes outside setState
      const node = this.createEffectNode(deviceType);

      // Prepare device record
      const device: Device = {
        id,
        type: deviceType,
        name: deviceType,
        bypass: false,
        node,
      };

      // Update state atomically
      useEngineStore.setState((state) => {
        const updatedChannel = {
          ...state.mix.channels[channelId],
          preDevices: [...state.mix.channels[channelId].preDevices, node],
        };

        return {
          mix: {
            ...state.mix,
            devices: {
              ...state.mix.devices,
              [id]: device,
            },
            channels: {
              ...state.mix.channels,
              [channelId]: updatedChannel,
            },
          },
        };
      });

      // Reconnect audio nodes after state is updated
      try {
        this.reconnectChannelNodes(
          useEngineStore.getState().mix.channels[channelId],
        );
      } catch (reconnectError) {
        // If reconnection fails, we need to clean up and rollback
        this.handleDeviceAdditionFailure(id, node, channelId);
        throw reconnectError;
      }

      return id;
    } catch (error) {
      // Clean up any created resources on failure
      console.error("Failed to add device:", error);
      throw error;
    }
  }

  private handleDeviceAdditionFailure(
    deviceId: string,
    node: ToneEffectType,
    channelId: string,
  ): void {
    try {
      // Cleanup the created node
      node.disconnect();
      node.dispose();

      // Rollback state
      useEngineStore.setState((state) => {
        const { [deviceId]: removed, ...remainingDevices } = state.mix.devices;
        const channel = state.mix.channels[channelId];

        return {
          mix: {
            ...state.mix,
            devices: remainingDevices,
            channels: {
              ...state.mix.channels,
              [channelId]: {
                ...channel,
                preDevices: channel.preDevices.filter((d) => d !== node),
              },
            },
          },
        };
      });
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup after device addition failure:",
        cleanupError,
      );
      // At this point, manual intervention might be needed
      // Could emit an event for error handling system
    }
  }

  removeDevice(channelId: string, deviceId: string): void {
    useEngineStore.setState((state) => {
      const device = state.mix.devices[deviceId];
      const channel = state.mix.channels[channelId];

      if (!device || !channel) return state;

      // Remove from pre/post device arrays
      const updatedChannel = {
        ...channel,
        preDevices: channel.preDevices.filter((node) => node !== device.node),
        postDevices: channel.postDevices.filter((node) => node !== device.node),
      };

      // Remove device record
      const { [deviceId]: removed, ...remainingDevices } = state.mix.devices;

      // Dispose the actual node
      device.node.dispose();

      return {
        mix: {
          ...state.mix,
          devices: remainingDevices,
          channels: {
            ...state.mix.channels,
            [channelId]: updatedChannel,
          },
        },
      };
    });

    // Reconnect the chain
    this.reconnectChannelNodes(
      useEngineStore.getState().mix.channels[channelId],
    );
  }

  createSend(fromId: string, toId: string): string {
    const id = uuidv4();

    // Validate channels and permissions first
    const currentState = useEngineStore.getState();
    const sourceChannel = currentState.mix.channels[fromId];
    const targetChannel = currentState.mix.channels[toId];

    if (!sourceChannel || !targetChannel) {
      throw new Error("Source or target channel not found");
    }

    const isReturnTrack = currentState.arrangement.returnTracks.includes(toId);
    if (!isReturnTrack && toId !== currentState.mix.masterChannelId) {
      throw new Error("Can only send to return or master channels");
    }

    // Create audio nodes outside of setState
    let gain: Tone.Gain | null = null;
    try {
      gain = new Tone.Gain(0);
      gain.connect(targetChannel.input);

      const send: Send = {
        id,
        name: `Send to ${targetChannel.name}`,
        returnTrackId: toId,
        preFader: false,
        gain,
      };

      // Update state atomically
      useEngineStore.setState((state) => {
        const updatedSourceChannel = state.mix.channels[fromId];

        // Double-check channel still exists
        if (!updatedSourceChannel) {
          throw new Error("Source channel no longer exists");
        }

        return {
          mix: {
            ...state.mix,
            channels: {
              ...state.mix.channels,
              [fromId]: {
                ...updatedSourceChannel,
                sends: [...updatedSourceChannel.sends, send],
              },
            },
          },
        };
      });

      return id;
    } catch (error) {
      // Clean up on any error
      if (gain) {
        try {
          gain.disconnect();
          gain.dispose();
        } catch (cleanupError) {
          console.warn("Failed to cleanup gain node:", cleanupError);
        }
      }
      console.error("Failed to create send:", error);
      throw error;
    }
  }

  updateSend(channelId: string, sendId: string, updates: Partial<Send>): void {
    // First get current state and validate
    const currentState = useEngineStore.getState();
    const channel = currentState.mix.channels[channelId];
    if (!channel) {
      throw new Error("Channel not found");
    }

    const currentSend = channel.sends.find((s) => s.id === sendId);
    if (!currentSend) {
      throw new Error("Send not found");
    }

    try {
      // Handle audio routing changes outside setState
      if (updates.returnTrackId) {
        this.updateSendRouting(
          currentSend,
          updates.returnTrackId,
          currentState,
        );
      }

      // Handle pre/post fader changes outside setState
      if (updates.preFader !== undefined) {
        this.updateSendFaderRouting(
          channel,
          currentSend,
          updates.preFader,
          currentState,
        );
      }

      // Handle gain changes outside setState
      if (updates.gain?.gain.value !== undefined) {
        currentSend.gain.gain.value = updates.gain.gain.value;
      }

      // Finally, update state atomically
      useEngineStore.setState((state) => {
        const channel = state.mix.channels[channelId];
        const sendIndex = channel.sends.findIndex((s) => s.id === sendId);
        const newSends = [...channel.sends];

        newSends[sendIndex] = {
          ...currentSend,
          ...updates,
          gain: updates.gain ?? currentSend.gain,
        };

        return {
          mix: {
            ...state.mix,
            channels: {
              ...state.mix.channels,
              [channelId]: {
                ...channel,
                sends: newSends,
              },
            },
          },
        };
      });
    } catch (error) {
      console.error("Failed to update send:", error);
      // Attempt to restore original routing
      this.restoreSendRouting(channel, currentSend, currentState);
      throw error;
    }
  }

  private updateSendRouting(
    currentSend: Send,
    newReturnTrackId: string,
    state: EngineState,
  ): void {
    const newReturnChannel = state.mix.channels[newReturnTrackId];

    if (!newReturnChannel) {
      throw new Error("Target return track not found");
    }

    if (newReturnChannel.type !== "return") {
      throw new Error("Target channel must be a return track");
    }

    try {
      // Disconnect from old return track
      currentSend.gain.disconnect();

      // Connect to new return track
      currentSend.gain.connect(newReturnChannel.input);
    } catch (error) {
      console.error("Failed to update send routing:", error);
      throw error;
    }
  }

  private updateSendFaderRouting(
    channel: MixerChannel,
    currentSend: Send,
    preFader: boolean,
    state: EngineState,
  ): void {
    try {
      const send = currentSend.gain;
      send.disconnect();

      if (preFader) {
        channel.input.connect(send);
      } else {
        channel.channel.connect(send);
      }

      const returnChannel = state.mix.channels[currentSend.returnTrackId];
      send.connect(returnChannel.input);
    } catch (error) {
      console.error("Failed to update fader routing:", error);
      throw error;
    }
  }

  private restoreSendRouting(
    channel: MixerChannel,
    send: Send,
    state: EngineState,
  ): void {
    try {
      send.gain.disconnect();

      if (send.preFader) {
        channel.input.connect(send.gain);
      } else {
        channel.channel.connect(send.gain);
      }

      const returnChannel = state.mix.channels[send.returnTrackId];
      if (returnChannel) {
        send.gain.connect(returnChannel.input);
      }
    } catch (error) {
      console.error("Failed to restore send routing:", error);
      // At this point, manual intervention might be needed
      throw new Error(
        "Critical routing failure - manual reset may be required",
      );
    }
  }

  removeSend(channelId: string, sendId: string): void {
    // First, validate and get current state outside setState
    const currentState = useEngineStore.getState();
    const channel = currentState.mix.channels[channelId];

    if (!channel) {
      throw new Error("Channel not found");
    }

    const send = channel.sends.find((s) => s.id === sendId);
    if (!send) {
      throw new Error("Send not found");
    }

    try {
      // Clean up audio node outside setState
      this.cleanupSendNode(send);

      // Then update state atomically
      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          channels: {
            ...state.mix.channels,
            [channelId]: {
              ...channel,
              sends: channel.sends.filter((s) => s.id !== sendId),
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to remove send:", error);
      throw error;
    }
  }

  private cleanupSendNode(send: Send): void {
    try {
      // Disconnect before disposal to prevent audio glitches
      send.gain.disconnect();
      send.gain.dispose();
    } catch (error) {
      console.warn("Failed to cleanup send node:", error);
      throw error;
    }
  }

  setSendAmount(channelId: string, sendId: string, amount: number): void {
    // Validate and get data outside setState
    const currentState = useEngineStore.getState();
    const channel = currentState.mix.channels[channelId];

    if (!channel) {
      throw new Error("Channel not found");
    }

    const send = channel.sends.find((s) => s.id === sendId);
    if (!send) {
      throw new Error("Send not found");
    }

    // Clamp amount between 0 and 1
    const clampedAmount = Math.max(0, Math.min(1, amount));

    try {
      // Update Tone.js node outside setState
      send.gain.gain.value = clampedAmount;

      // Then update state atomically
      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          channels: {
            ...state.mix.channels,
            [channelId]: {
              ...channel,
              sends: channel.sends.map((s) =>
                s.id === sendId
                  ? { ...s } // No need to update gain as it's a reference
                  : s,
              ),
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to update send amount:", error);
      throw error;
    }
  }

  updateDevice<T extends EffectOptions>(
    channelId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void {
    // First validate and get current state
    const currentState = useEngineStore.getState();
    const device = currentState.mix.devices[deviceId];
    const channel = currentState.mix.channels[channelId];

    if (!device || !channel) {
      throw new Error("Device or channel not found");
    }

    try {
      // Handle audio parameters outside setState
      this.updateDeviceParameters(device, updates);

      // Then update state atomically
      useEngineStore.setState((state) => ({
        mix: {
          ...state.mix,
          devices: {
            ...state.mix.devices,
            [deviceId]: {
              ...device,
              ...updates,
              // Preserve the node reference
              node: device.node,
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to update device parameters:", error);
      throw error;
    }
  }

  private updateDeviceParameters<T extends EffectOptions>(
    device: Device,
    updates: Partial<Device<T>>,
  ): void {
    try {
      // Handle bypass
      if (updates.bypass !== undefined) {
        try {
          device.node.wet.value = updates.bypass ? 0 : 1;
        } catch (e) {
          console.warn("Failed to update bypass state", e);
        }
      }

      // Handle other parameters
      if (updates.options) {
        const options = updates.options;

        (Object.keys(options) as (keyof T)[]).forEach((key) => {
          const value = options[key];
          if (value !== undefined) {
            try {
              const param = device.node[key as keyof ToneEffectType];

              if (param instanceof Tone.Param) {
                param.value = value;
              } else if (key in device.node) {
                (device.node as Record<keyof T, unknown>)[key] = value;
              }
            } catch (e) {
              console.warn(`Failed to update parameter ${String(key)}:`, e);
            }
          }
        });
      }
    } catch (error) {
      console.error("Parameter update failed:", error);
      throw error;
    }
  }

  private reconnectChannelNodes(channel: MixerChannel): MixerChannel {
    // Disconnect existing chain
    channel.input.disconnect();
    channel.preDevices.forEach((device) => device.disconnect());
    channel.postDevices.forEach((device) => device.disconnect());
    channel.channel.disconnect();

    // Start with input node
    let currentNode: Tone.ToneAudioNode = channel.input;
    const preDevices: ToneEffectType[] = [];
    const postDevices: ToneEffectType[] = [];

    // Pre-fader chain
    channel.preDevices.forEach((device) => {
      // device is already ToneEffectType from MixerChannel type
      currentNode.connect(device);
      preDevices.push(device);
      currentNode = device; // ToneEffectType extends ToneAudioNode, so this is safe
    });

    // Connect to channel strip
    currentNode.connect(channel.channel);
    currentNode = channel.channel;

    // Post-fader chain
    channel.postDevices.forEach((device) => {
      currentNode.connect(device);
      postDevices.push(device);
      currentNode = device;
    });

    // Final connections
    currentNode.connect(channel.meter);

    // Output routing
    if (channel.type !== "master") {
      const state = useEngineStore.getState().mix;
      const targetChannel = channel.output.targetId
        ? state.channels[channel.output.targetId]
        : state.channels[state.masterChannelId];

      if (targetChannel) {
        currentNode.connect(targetChannel.input);
      }
    } else {
      currentNode.toDestination();
    }

    // Reconnect sends
    channel.sends.forEach((send) => {
      if (send.preFader) {
        channel.input.connect(send.gain);
      } else {
        channel.channel.connect(send.gain);
      }
    });

    return {
      ...channel,
      preDevices,
      postDevices,
    };
  }

  getMeterData(channelId: string): AudioMeterData {
    const state = useEngineStore.getState().mix;
    return state.meterData[channelId] || { peak: [0, 0], rms: [0, 0] };
  }

  getState(): MixState {
    return useEngineStore.getState().mix;
  }

  dispose(): void {
    // Check disposed state first
    if (this.disposed) return;
    this.disposed = true;

    // Stop meter updates immediately
    clearInterval(this.meterUpdateInterval);

    // Get current state once
    const currentState = useEngineStore.getState();

    try {
      // Cleanup all audio nodes outside setState
      this.disposeAllAudioNodes(currentState.mix);

      // Finally update state atomically
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
      // Still attempt to reset state even if cleanup fails
      useEngineStore.setState({
        mix: {
          channels: {},
          devices: {},
          masterChannelId: "",
          meterData: {},
        },
      });
      throw error; // Re-throw for upstream handling
    }
  }

  private disposeAllAudioNodes(mixState: MixState): void {
    // Dispose channels
    this.disposeChannels(mixState.channels);

    // Dispose devices
    this.disposeDevices(mixState.devices);
  }

  private disposeChannels(channels: Record<string, MixerChannel>): void {
    Object.values(channels).forEach((channel) => {
      this.disposeChannel(channel);
    });
  }

  private disposeChannel(channel: MixerChannel): void {
    // Dispose pre-devices
    channel.preDevices.forEach((device) => {
      this.safeDispose(device, "pre-device");
    });

    // Dispose post-devices
    channel.postDevices.forEach((device) => {
      this.safeDispose(device, "post-device");
    });

    // Dispose sends
    channel.sends.forEach((send) => {
      this.safeDispose(send.gain, "send gain");
    });

    // Dispose channel nodes
    this.safeDispose(channel.input, "channel input");
    this.safeDispose(channel.channel, "channel strip");
    this.safeDispose(channel.meter, "channel meter");
  }

  private disposeDevices(devices: Record<string, Device>): void {
    Object.values(devices).forEach((device) => {
      this.safeDispose(device.node, `device ${device.name}`);
    });
  }

  private safeDispose(
    node: { dispose: () => void } | undefined,
    context: string,
  ): void {
    if (!node) return;

    try {
      node.dispose();
    } catch (error) {
      console.warn(`Failed to dispose ${context}:`, error);
      // Don't rethrow - we want to continue with other disposals
    }
  }
}
