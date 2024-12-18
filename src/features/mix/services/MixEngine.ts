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
import { useEngineStore } from "@/core/stores/useEngineStore";
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
    if (this.disposed) return;

    useEngineStore.setState((state) => {
      // Early exit if no channels
      if (Object.keys(state.mix.channels).length === 0) return state;

      // Process in chunks if too many channels
      const meterData = Object.values(state.mix.channels).reduce(
        (acc, channel) => {
          const values = channel.meter.getValue();
          acc[channel.id] = {
            peak: Array.isArray(values) ? values : [values, values],
            rms: Array.isArray(values)
              ? values.map((v) => v * 0.7)
              : [values * 0.7, values * 0.7],
          };
          return acc;
        },
        {} as Record<string, AudioMeterData>,
      );

      return {
        mix: {
          ...state.mix,
          meterData,
        },
      };
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
      throw new Error("Failed to create channel");
    }
  }

  deleteChannel(id: string): void {
    useEngineStore.setState((state) => {
      const channel = state.mix.channels[id];
      if (!channel || id === state.mix.masterChannelId) {
        throw new Error("Cannot delete channel");
      }

      // Clean up devices
      channel.preDevices.forEach((device) => device.disconnect());
      channel.postDevices.forEach((device) => device.disconnect());

      // Clean up sends
      channel.sends.forEach((send) => send.gain.dispose());

      // Clean up channel nodes
      channel.input.dispose();
      channel.channel.dispose();
      channel.meter.dispose();

      // Remove channel and its devices using destructuring
      const { [id]: removedChannel, ...remainingChannels } = state.mix.channels;

      // Update state
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

    useEngineStore.setState((state) => {
      const channel = state.mix.channels[channelId];
      if (!channel) throw new Error("Channel not found");

      // Create the effect node
      const node = this.createEffectNode(deviceType);

      // Create device record
      const device: Device = {
        id,
        type: deviceType,
        name: deviceType,
        bypass: false,
        node,
      };

      // Add to pre-fader chain by default
      const updatedChannel = {
        ...channel,
        preDevices: [...channel.preDevices, node], // Store the actual node
      };

      return {
        mix: {
          ...state.mix,
          devices: {
            ...state.mix.devices,
            [id]: device, // Store complete device info
          },
          channels: {
            ...state.mix.channels,
            [channelId]: updatedChannel,
          },
        },
      };
    });

    // Reconnect the audio nodes after state update
    this.reconnectChannelNodes(
      useEngineStore.getState().mix.channels[channelId],
    );

    return id;
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

    useEngineStore.setState((state) => {
      const sourceChannel = state.mix.channels[fromId];
      const targetChannel = state.mix.channels[toId];

      // Validation
      if (!sourceChannel || !targetChannel) {
        throw new Error("Source or target channel not found");
      }

      const isReturnTrack = state.arrangement.returnTracks.includes(toId);
      if (!isReturnTrack && toId !== state.mix.masterChannelId) {
        throw new Error("Can only send to return or master channels");
      }

      try {
        // Create and connect audio nodes within setState to ensure atomic operation
        const gain = new Tone.Gain(0);
        gain.connect(targetChannel.input);

        const send: Send = {
          id,
          name: `Send to ${targetChannel.name}`,
          returnTrackId: toId,
          preFader: false,
          gain,
        };

        return {
          mix: {
            ...state.mix,
            channels: {
              ...state.mix.channels,
              [fromId]: {
                ...sourceChannel,
                sends: [...sourceChannel.sends, send],
              },
            },
          },
        };
      } catch (error) {
        // Clean up if node creation/connection fails
        console.error("Failed to create send:", error);
        throw new Error("Failed to create send connection");
      }
    });

    return id;
  }

  updateSend(channelId: string, sendId: string, updates: Partial<Send>): void {
    useEngineStore.setState((state) => {
      const channel = state.mix.channels[channelId];
      if (!channel) {
        throw new Error("Channel not found");
      }

      const sendIndex = channel.sends.findIndex((s) => s.id === sendId);
      if (sendIndex === -1) {
        throw new Error("Send not found");
      }

      const currentSend = channel.sends[sendIndex];
      const newSends = [...channel.sends];

      // Handle audio routing updates
      if (
        updates.returnTrackId &&
        updates.returnTrackId !== currentSend.returnTrackId
      ) {
        const newReturnChannel = state.mix.channels[updates.returnTrackId];

        if (!newReturnChannel) {
          throw new Error("Target return track not found");
        }

        if (newReturnChannel.type !== "return") {
          throw new Error("Target channel must be a return track");
        }

        // Disconnect from old return track
        currentSend.gain.disconnect();

        // Connect to new return track
        currentSend.gain.connect(newReturnChannel.input);
      }

      // Handle pre/post fader routing changes
      if (
        updates.preFader !== undefined &&
        updates.preFader !== currentSend.preFader
      ) {
        const send = currentSend.gain;

        // Disconnect current routing
        send.disconnect();

        if (updates.preFader) {
          // Pre-fader: Connect from channel input
          channel.input.connect(send);
        } else {
          // Post-fader: Connect after channel processing
          channel.channel.connect(send);
        }

        // Reconnect to return track
        const returnChannel = state.mix.channels[currentSend.returnTrackId];
        send.connect(returnChannel.input);
      }

      // Handle gain changes
      if (updates.gain?.gain.value !== undefined) {
        currentSend.gain.gain.value = updates.gain.gain.value;
      }

      // Update send state
      newSends[sendIndex] = {
        ...currentSend,
        ...updates,
        // Preserve the Tone.js node instance
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
  }

  removeSend(channelId: string, sendId: string): void {
    try {
      useEngineStore.setState((state) => {
        const channel = state.mix.channels[channelId];
        if (!channel) {
          throw new Error("Channel not found");
        }

        const send = channel.sends.find((s) => s.id === sendId);
        if (!send) {
          throw new Error("Send not found");
        }

        // Dispose send gain node
        try {
          send.gain.dispose();
        } catch (error) {
          console.warn("Failed to dispose send gain node:", error);
          // Continue with state update even if dispose fails
        }

        return {
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
        };
      });
    } catch (error) {
      console.error("Failed to remove send:", error);
      throw error; // Re-throw to let caller handle
    }
  }

  setSendAmount(channelId: string, sendId: string, amount: number): void {
    useEngineStore.setState((state) => {
      const channel = state.mix.channels[channelId];
      if (!channel) {
        throw new Error("Channel not found");
      }

      const send = channel.sends.find((s) => s.id === sendId);
      if (!send) {
        throw new Error("Send not found");
      }

      // Clamp amount between 0 and 1
      const clampedAmount = Math.max(0, Math.min(1, amount));

      // Update the Tone.js gain node
      send.gain.gain.value = clampedAmount;

      return {
        mix: {
          ...state.mix,
          channels: {
            ...state.mix.channels,
            [channelId]: {
              ...channel,
              sends: channel.sends.map((s) =>
                s.id === sendId ? { ...s, gain: send.gain } : s,
              ),
            },
          },
        },
      };
    });
  }

  updateDevice<T extends EffectOptions>(
    channelId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void {
    useEngineStore.setState((state) => {
      const device = state.mix.devices[deviceId];
      const channel = state.mix.channels[channelId];

      if (!device || !channel) {
        throw new Error("Device or channel not found");
      }

      // Handle bypass separately as it's common to all effects
      if (updates.bypass !== undefined) {
        device.node.wet.value = updates.bypass ? 0 : 1;
      }

      // Type-safe options update
      if (updates.options) {
        // Ensure we only access valid parameters for this effect type
        const options = updates.options;

        // Handle each parameter based on whether it's an AudioParam or direct value
        (Object.keys(options) as (keyof T)[]).forEach((key) => {
          const value = options[key];
          if (value !== undefined) {
            const param = device.node[key as keyof ToneEffectType];

            if (param instanceof Tone.Param) {
              param.value = value;
            } else if (key in device.node) {
              // Type assertion here is safer as we've checked the key exists
              (device.node as Record<keyof T, unknown>)[key] = value;
            }
          }
        });
      }

      return {
        mix: {
          ...state.mix,
          devices: {
            ...state.mix.devices,
            [deviceId]: {
              ...device,
              ...updates,
            },
          },
        },
      };
    });
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
    useEngineStore.setState((state) => {
      if (this.disposed) return state;
      this.disposed = true;

      clearInterval(this.meterUpdateInterval);

      try {
        // Dispose channels
        Object.values(state.mix.channels).forEach((channel) => {
          try {
            channel.input.dispose();
            channel.channel.dispose();
            channel.meter.dispose();
            channel.preDevices.forEach((device) => {
              try {
                device.dispose();
              } catch (e) {
                console.warn("Failed to dispose device:", e);
              }
            });
            channel.postDevices.forEach((device) => {
              try {
                device.dispose();
              } catch (e) {
                console.warn("Failed to dispose device:", e);
              }
            });
            channel.sends.forEach((send) => {
              try {
                send.gain.dispose();
              } catch (e) {
                console.warn("Failed to dispose send:", e);
              }
            });
          } catch (e) {
            console.warn("Failed to dispose channel:", e);
          }
        });

        // Dispose devices
        Object.values(state.mix.devices).forEach((device) => {
          try {
            device.node.dispose();
          } catch (e) {
            console.warn("Failed to dispose device:", e);
          }
        });
      } catch (e) {
        console.error("Error during dispose:", e);
      }

      // Reset to initial state regardless of errors
      return {
        mix: {
          channels: {},
          devices: {},
          masterChannelId: "",
          meterData: {},
        },
      };
    });
  }
}
