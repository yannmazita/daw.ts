// src/features/mixer/services/MixerManager.ts

import * as Tone from "tone";
import {
  MixerState,
  MixerChannel,
  Mixer,
  MixerActions,
  Effect,
  Send,
  Meter,
  MeterData,
  SerializableChannel,
} from "@/core/interfaces/mixer";
import {
  BaseEffectOptions,
  EffectName,
  EffectOptions,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
  ToneEffectType,
} from "@/core/types/effect";
import { NormalRange } from "tone/build/esm/core/type/Units";

export class MixerManager implements Mixer {
  public readonly state: MixerState;
  private readonly runtimeChannels: Map<string, MixerChannel>;
  private meterUpdateInterval: number | null = null;
  private readonly defaultMeterConfig: Omit<Meter, "data"> = {
    isEnabled: false,
    smoothing: 0.8,
    channels: 2,
  };

  constructor() {
    const master = this.createDefaultChannel("master");
    this.state = {
      master: this.serializeChannel(master),
      channels: [],
    };

    this.runtimeChannels = new Map();
    this.runtimeChannels.set(master.id, master);
    master.channel.toDestination();
  }

  private createDefaultChannel(name: string): MixerChannel {
    return {
      id: `channel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      volume: 0,
      pan: 0,
      mute: false,
      solo: false,
      effects: [],
      sends: [],
      meter: null,
      channel: new Tone.Channel(),
      dispose: () => this.disposeChannel(this.state.master.id),
    };
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
        throw new Error(`Unknown effect type: ${type}`);
    }
  }

  private createEffect<T extends EffectOptions>(
    type: EffectName,
    options?: Partial<T>,
  ): Effect<T> {
    const defaultOptions: BaseEffectOptions = { wet: 1 };
    // Type assertion here is safe because we know BaseEffectOptions is compatible with all T
    const mergedOptions = { ...defaultOptions, ...options } as T;

    const effectNode = this.createEffectNode(type, mergedOptions);
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      bypass: false,
      wet: mergedOptions.wet,
      options: mergedOptions,
      node: effectNode,
    };
  }

  private createSend(targetId: string, gain: NormalRange = 1): Send {
    return {
      id: `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: `Send to ${targetId}`,
      targetId,
      gain,
      node: new Tone.Gain(gain),
    };
  }

  private createMeter(config: Partial<Omit<Meter, "data">> = {}): Tone.Meter {
    const meterConfig = { ...this.defaultMeterConfig, ...config };
    return new Tone.Meter({
      channelCount: meterConfig.channels,
      smoothing: meterConfig.smoothing,
      normalRange: true,
    });
  }

  private serializeChannel(channel: MixerChannel): SerializableChannel {
    const { channel: _, dispose: __, ...serializableChannel } = channel;
    return serializableChannel;
  }

  private updateChannelRouting(channelId: string): void {
    const channel = this.runtimeChannels.get(channelId);
    if (!channel) return;

    channel.channel.disconnect();

    let lastNode: Tone.ToneAudioNode = channel.channel;

    // Connect effects chain
    channel.effects
      .filter((effect) => !effect.bypass)
      .forEach((effect) => {
        lastNode.connect(effect.node);
        lastNode = effect.node;
      });

    // Connect sends
    channel.sends.forEach((send) => {
      lastNode.connect(send.node);
      const targetChannel = this.runtimeChannels.get(send.targetId);
      if (targetChannel) {
        send.node.connect(targetChannel.channel);
      }
    });

    // Connect to master unless this is the master channel
    if (channelId !== this.state.master.id) {
      const master = this.runtimeChannels.get(this.state.master.id);
      if (master) {
        lastNode.connect(master.channel);
      }
    }

    // Connect meter if enabled
    if (channel.meter?.isEnabled) {
      lastNode.connect(channel.meter as unknown as Tone.Meter);
    }
  }

  private disposeChannel(channelId: string): void {
    const channel = this.runtimeChannels.get(channelId);
    if (!channel) return;

    // Dispose audio nodes
    channel.channel.dispose();
    channel.effects.forEach((effect) => effect.node.dispose());
    channel.sends.forEach((send) => send.node.dispose());
    if (channel.meter) {
      (channel.meter as unknown as Tone.Meter).dispose();
    }
  }

  private updateState(channelId: string, channel: MixerChannel): void {
    const serialized = this.serializeChannel(channel);
    if (channelId === this.state.master.id) {
      this.state.master = serialized;
    } else {
      const index = this.state.channels.findIndex((c) => c.id === channelId);
      if (index !== -1) {
        this.state.channels[index] = serialized;
      }
    }
  }

  private startMeterUpdates(): void {
    if (this.meterUpdateInterval) return;

    const updateMeters = () => {
      this.runtimeChannels.forEach((channel) => {
        if (channel.meter?.isEnabled) {
          const meterNode = channel.meter as unknown as Tone.Meter;
          const values = meterNode.getValue();

          if (channel.meter) {
            channel.meter.data = { values };
          }

          this.updateState(channel.id, channel);
        }
      });

      this.meterUpdateInterval = requestAnimationFrame(updateMeters);
    };

    this.meterUpdateInterval = requestAnimationFrame(updateMeters);
  }

  public readonly actions: MixerActions = {
    createChannel: (name: string): string => {
      const channel = this.createDefaultChannel(name);
      this.runtimeChannels.set(channel.id, channel);
      this.state.channels.push(this.serializeChannel(channel));
      return channel.id;
    },

    removeChannel: (id: string): void => {
      if (id === this.state.master.id) return;

      this.disposeChannel(id);
      this.runtimeChannels.delete(id);
      this.state.channels = this.state.channels.filter((c) => c.id !== id);
    },

    updateChannel: (
      id: string,
      updates: Partial<SerializableChannel>,
    ): void => {
      const channel = this.runtimeChannels.get(id);
      if (!channel) return;

      if (updates.volume !== undefined)
        channel.channel.volume.value = updates.volume;
      if (updates.pan !== undefined) channel.channel.pan.value = updates.pan;
      if (updates.mute !== undefined) channel.channel.mute = updates.mute;

      Object.assign(channel, updates);
      this.updateState(id, channel);
    },

    addEffect: <T extends EffectOptions>(
      channelId: string,
      type: EffectName,
      options?: Partial<T>,
    ): string => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) throw new Error(`Channel ${channelId} not found`);

      const effect = this.createEffect<T>(type, options);
      channel.effects.push(effect);

      this.updateChannelRouting(channelId);
      this.updateState(channelId, channel);

      return effect.id;
    },

    removeEffect: (channelId: string, effectId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.find((e) => e.id === effectId);
      if (effect) {
        effect.node.dispose();
        channel.effects = channel.effects.filter((e) => e.id !== effectId);

        this.updateChannelRouting(channelId);
        this.updateState(channelId, channel);
      }
    },

    updateEffect: <T extends EffectOptions>(
      channelId: string,
      effectId: string,
      updates: Partial<T>,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.find((e) => e.id === effectId);
      if (effect) {
        // Update the node parameters
        Object.entries(updates).forEach(([key, value]) => {
          if (key in effect.node) {
            (effect.node as any)[key] = value;
          }
        });

        // Update the options
        effect.options = { ...effect.options, ...updates } as T;

        // If wet parameter is updated, update the effect wet value
        if ("wet" in updates) {
          effect.wet = (updates as BaseEffectOptions).wet;
        }

        this.updateState(channelId, channel);
      }
    },

    bypassEffect: (
      channelId: string,
      effectId: string,
      bypass: boolean,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.find((e) => e.id === effectId);
      if (effect) {
        effect.bypass = bypass;
        this.updateChannelRouting(channelId);
        this.updateState(channelId, channel);
      }
    },

    createSend: (
      fromId: string,
      toId: string,
      gain: NormalRange = 1,
    ): string => {
      const fromChannel = this.runtimeChannels.get(fromId);
      const toChannel = this.runtimeChannels.get(toId);
      if (!fromChannel || !toChannel) throw new Error("Invalid channel IDs");

      const send = this.createSend(toId, gain);
      fromChannel.sends.push(send);

      this.updateChannelRouting(fromId);
      this.updateState(fromId, fromChannel);

      return send.id;
    },

    removeSend: (channelId: string, sendId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const send = channel.sends.find((s) => s.id === sendId);
      if (send) {
        send.node.dispose();
        channel.sends = channel.sends.filter((s) => s.id !== sendId);

        this.updateChannelRouting(channelId);
        this.updateState(channelId, channel);
      }
    },

    updateSend: (
      channelId: string,
      sendId: string,
      gain: NormalRange,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const send = channel.sends.find((s) => s.id === sendId);
      if (send) {
        send.gain = gain;
        send.node.gain.value = gain;
        this.updateState(channelId, channel);
      }
    },

    enableMetering: (channelId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      if (!channel.meter) {
        const meterNode = this.createMeter();
        channel.meter = {
          ...this.defaultMeterConfig,
          isEnabled: true,
          data: { values: [] },
        };
        (channel.meter as unknown as Tone.Meter) = meterNode;

        this.updateChannelRouting(channelId);
        this.startMeterUpdates();
      } else {
        channel.meter.isEnabled = true;
      }

      this.updateState(channelId, channel);
    },

    disableMetering: (channelId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel?.meter) return;

      channel.meter.isEnabled = false;
      this.updateState(channelId, channel);

      // Check if any meters are still enabled
      const hasEnabledMeters = Array.from(this.runtimeChannels.values()).some(
        (ch) => ch.meter?.isEnabled,
      );

      if (!hasEnabledMeters && this.meterUpdateInterval) {
        cancelAnimationFrame(this.meterUpdateInterval);
        this.meterUpdateInterval = null;
      }
    },

    getMeterData: (channelId: string): MeterData | null => {
      const channel = this.runtimeChannels.get(channelId);
      return channel?.meter?.data ?? null;
    },

    updateMeterConfig: (
      channelId: string,
      config: Partial<Omit<Meter, "data">>,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel?.meter) return;

      Object.assign(channel.meter, config);
      this.updateState(channelId, channel);
    },

    getInputNode: (channelId: string): Tone.ToneAudioNode => {
      const channel = this.runtimeChannels.get(channelId);
      return (
        channel?.channel ??
        this.runtimeChannels.get(this.state.master.id).channel
      );
    },

    getOutputNode: (channelId: string): Tone.ToneAudioNode => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) {
        return this.runtimeChannels.get(this.state.master.id).channel;
      }

      const lastEffect = channel.effects.filter((e) => !e.bypass).pop();
      return lastEffect?.node ?? channel.channel;
    },
  };

  public dispose(): void {
    if (this.meterUpdateInterval) {
      cancelAnimationFrame(this.meterUpdateInterval);
      this.meterUpdateInterval = null;
    }

    this.runtimeChannels.forEach((channel) => this.disposeChannel(channel.id));
    this.runtimeChannels.clear();

    const master = this.createDefaultChannel("master");
    this.state.channels = [];
    this.state.master = this.serializeChannel(master);
    this.runtimeChannels.set(master.id, master);
    master.channel.toDestination();
  }
}
