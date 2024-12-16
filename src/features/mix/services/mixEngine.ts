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
    // Initialize master channel if not exists
    const state = useEngineStore.getState().mix;
    if (!state.masterChannelId) {
      this.createChannel("master");
    }

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

    const state = useEngineStore.getState().mix;
    const meterData: Record<string, AudioMeterData> = {};

    Object.values(state.channels).forEach((channel) => {
      const values = channel.meter.getValue();
      meterData[channel.id] = {
        peak: Array.isArray(values) ? values : [values, values],
        rms: Array.isArray(values)
          ? values.map((v) => v * 0.7)
          : [values * 0.7, values * 0.7],
      };
    });

    useEngineStore.getState().updateMix({ meterData });
  }

  createChannel(type: MixerChannel["type"]): string {
    const id = uuidv4();
    const input = new Tone.Gain();
    const channel = this.createAudioNodes();
    const meter = new Tone.Meter();

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

    // Connect nodes
    input.connect(meter);
    input.connect(channel);

    useEngineStore.getState().updateMix({
      channels: {
        ...useEngineStore.getState().mix.channels,
        [id]: newChannel,
      },
    });
    return id;
  }

  deleteChannel(id: string): void {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[id];

    if (!channel || channel.type === "master") {
      throw new Error("Cannot delete master channel");
    }

    // Disconnect and dispose all nodes
    channel.input.dispose();
    channel.channel.dispose();
    channel.meter.dispose();
    channel.preDevices.forEach((device) => device.dispose());
    channel.postDevices.forEach((device) => device.dispose());
    channel.sends.forEach((send) => send.gain.dispose());

    const { [id]: _, ...remainingChannels } = state.channels;
    useEngineStore.getState().updateMix({ channels: remainingChannels });
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
    const node = this.createEffectNode(deviceType);

    const device: Device = {
      id,
      type: deviceType,
      name: deviceType,
      bypass: false,
      node,
    };

    useEngineStore.getState().updateMix({
      devices: { ...useEngineStore.getState().mix.devices, [id]: device },
    });
    // Update channel connections
    this.updateChannelConnections(channelId);

    return id;
  }

  private updateChannelConnections(channelId: string) {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[channelId];

    if (!channel) return;

    // Disconnect all nodes
    channel.input.disconnect();
    channel.preDevices.forEach((device) => device.disconnect());
    channel.postDevices.forEach((device) => device.disconnect());

    // Reconnect chain
    let currentNode: Tone.ToneAudioNode = channel.input;

    // Pre-fader devices
    channel.preDevices.forEach((device) => {
      currentNode.connect(device);
      currentNode = device;
    });

    // Connect to channel
    currentNode.connect(channel.channel);
    currentNode = channel.channel;

    // Post-fader devices
    channel.postDevices.forEach((device) => {
      currentNode.connect(device);
      currentNode = device;
    });

    // Final connection
    currentNode.connect(channel.meter);
    if (channel.type !== "master") {
      const master = state.channels[state.masterChannelId];
      if (master) {
        currentNode.connect(master.input);
      }
    }
  }

  removeDevice(channelId: string, deviceId: string): void {
    const state = useEngineStore.getState().mix;
    const device = state.devices[deviceId];
    const channel = state.channels[channelId];

    if (!device || !channel) {
      throw new Error("Device or channel not found");
    }

    // Dispose device nodes
    device.node.dispose();

    // Remove from devices list
    const { [deviceId]: _, ...remainingDevices } = state.devices;

    // Remove from channel's device chains
    const preDevices = channel.preDevices.filter((d) => d !== device.node);
    const postDevices = channel.postDevices.filter((d) => d !== device.node);

    useEngineStore.getState().updateMix({
      devices: remainingDevices,
      channels: {
        ...state.channels,
        [channelId]: {
          ...channel,
          preDevices,
          postDevices,
        },
      },
    });

    // Update channel connections
    this.updateChannelConnections(channelId);
  }

  createSend(fromId: string, toId: string): string {
    const state = useEngineStore.getState().mix;
    const sourceChannel = state.channels[fromId];
    const targetChannel = state.channels[toId];

    if (!sourceChannel || !targetChannel) {
      throw new Error("Source or target channel not found");
    }

    if (targetChannel.type !== "return" && targetChannel.type !== "master") {
      throw new Error("Can only send to return or master channels");
    }

    const id = uuidv4();
    const gain = new Tone.Gain(0);

    // Connect send to target channel
    gain.connect(targetChannel.input);

    const send: Send = {
      id,
      name: `Send to ${targetChannel.name}`,
      returnTrackId: toId,
      preFader: false,
      gain,
    };

    // Update source channel
    const updatedChannel = {
      ...sourceChannel,
      sends: [...sourceChannel.sends, send],
    };

    useEngineStore.getState().updateMix({
      channels: {
        ...state.channels,
        [fromId]: updatedChannel,
      },
    });

    return id;
  }

  updateSend(channelId: string, sendId: string, updates: Partial<Send>): void {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[channelId];
    if (!channel) {
      throw new Error("Channel not found");
    }
    const send = channel.sends.find((s) => s.id === sendId);
    if (!send) {
      throw new Error("Send not found");
    }
    // Update send
    const updatedSend = { ...send, ...updates };
    // Update channel
    const updatedChannel = {
      ...channel,
      sends: channel.sends.map((s) => (s.id === sendId ? updatedSend : s)),
    };
    useEngineStore.getState().updateMix({
      channels: {
        ...state.channels,
        [channelId]: updatedChannel,
      },
    });
  }

  removeSend(channelId: string, sendId: string): void {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[channelId];

    if (!channel) {
      throw new Error("Channel not found");
    }

    const send = channel.sends.find((s) => s.id === sendId);
    if (!send) {
      throw new Error("Send not found");
    }

    // Dispose send gain node
    send.gain.dispose();

    // Update channel
    const updatedChannel = {
      ...channel,
      sends: channel.sends.filter((s) => s.id !== sendId),
    };

    useEngineStore.getState().updateMix({
      channels: {
        ...state.channels,
        [channelId]: updatedChannel,
      },
    });
  }

  setSendAmount(channelId: string, sendId: string, amount: number): void {
    const state = useEngineStore.getState().mix;
    const channel = state.channels[channelId];

    if (!channel) {
      throw new Error("Channel not found");
    }

    const send = channel.sends.find((s) => s.id === sendId);
    if (!send) {
      throw new Error("Send not found");
    }

    // Clamp amount to valid range
    const clampedAmount = Math.min(Math.max(amount, 0), 1);
    send.gain.gain.value = clampedAmount;

    // Update channel
    const updatedChannel = {
      ...channel,
      sends: channel.sends.map((s) =>
        s.id === sendId ? { ...s, gain: send.gain } : s,
      ),
    };

    useEngineStore.getState().updateMix({
      channels: {
        ...state.channels,
        [channelId]: updatedChannel,
      },
    });
  }

  updateDevice<T extends EffectOptions>(
    channelId: string,
    deviceId: string,
    updates: Partial<Device<T>>,
  ): void {
    const state = useEngineStore.getState().mix;
    const device = state.devices[deviceId];
    const channel = state.channels[channelId];
    if (!device || !channel) {
      throw new Error("Device or channel not found");
    }
    // Update device
    const updatedDevice = { ...device, ...updates } as Device<T>;
    useEngineStore.getState().updateMix({
      devices: {
        ...state.devices,
        [deviceId]: updatedDevice,
      },
    });
    // Update channel connections
    this.updateChannelConnections(channelId);
  }

  getMeterData(channelId: string): AudioMeterData {
    const state = useEngineStore.getState().mix;
    return state.meterData[channelId] || { peak: [0, 0], rms: [0, 0] };
  }

  getState(): MixState {
    return useEngineStore.getState().mix;
  }

  dispose(): void {
    this.disposed = true;
    clearInterval(this.meterUpdateInterval);

    const state = useEngineStore.getState().mix;

    // Dispose all channels and their components
    Object.values(state.channels).forEach((channel) => {
      channel.input.dispose();
      channel.channel.dispose();
      channel.meter.dispose();
      channel.preDevices.forEach((device) => device.dispose());
      channel.postDevices.forEach((device) => device.dispose());
      channel.sends.forEach((send) => send.gain.dispose());
    });

    // Dispose all devices
    Object.values(state.devices).forEach((device) => {
      device.node.dispose();
    });
  }
}
