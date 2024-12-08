// src/features/mixer/services/MixerManager.ts

import * as Tone from "tone";
import {
  MixerState,
  MixerChannel,
  MixerChannelState,
  MixerActions,
  MeterConfig,
  MeterData,
} from "@/core/interfaces/mixer";
import {
  EffectName,
  EffectOptions,
  EffectState,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
  ToneEffectType,
} from "@/core/types/effect";
import { NormalRange } from "tone/build/esm/core/type/Units";

export class MixerManager {
  public readonly masterChannel: MixerChannel;
  public readonly channels: Map<string, MixerChannel>;
  public readonly state: MixerState;
  private meterUpdateInterval: number | null = null;
  private defaultMeterConfig: MeterConfig = {
    smoothing: 0.8,
    normalRange: false,
    channels: 2,
  };

  constructor() {
    // Initialize master channel with the same structure as other channels
    const masterState = this.createInitialChannelState("master");
    const masterToneChannel = new Tone.Channel().toDestination();

    this.masterChannel = {
      id: masterState.id,
      state: masterState,
      channel: masterToneChannel,
      effects: new Map(),
      sends: new Map(),
    };

    this.channels = new Map();
    this.state = {
      master: masterState,
      channels: [],
    };
  }

  private createInitialChannelState(name: string): MixerChannelState {
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
    };
  }

  private createChannel(state: MixerChannelState): MixerChannel {
    const channel = new Tone.Channel({
      volume: state.volume,
      pan: state.pan,
      mute: state.mute,
    });

    // Connect to master by default
    channel.connect(this.masterChannel.channel);

    return {
      id: state.id,
      state,
      channel,
      effects: new Map(),
      sends: new Map(),
    };
  }

  private createEffect(
    type: EffectName,
    options: any = { wet: 1 },
  ): ToneEffectType {
    //const context = Tone.getContext();
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

  private updateChannelRouting(channel: MixerChannel): void {
    // Disconnect everything
    channel.channel.disconnect();

    // Rebuild effect chain
    let lastNode: Tone.ToneAudioNode = channel.channel;
    const sortedEffects = Array.from(channel.effects.entries()).sort((a, b) => {
      const indexA = channel.state.effects.findIndex((e) => e.id === a[0]);
      const indexB = channel.state.effects.findIndex((e) => e.id === b[0]);
      return indexA - indexB;
    });

    for (const [, effect] of sortedEffects) {
      lastNode.connect(effect);
      lastNode = effect;
    }

    // Connect sends
    for (const [, send] of channel.sends) {
      lastNode.connect(send);
    }

    // Connect to master
    lastNode.connect(this.masterChannel.channel);
  }

  // Metering
  private createMeter(
    config: MeterConfig = this.defaultMeterConfig,
  ): Tone.Meter {
    return new Tone.Meter({
      smoothing: config.smoothing,
      normalRange: config.normalRange,
      channelCount: config.channels,
    });
  }

  private setupChannelMetering(
    channel: MixerChannel,
    config: MeterConfig = this.defaultMeterConfig,
  ) {
    // Clean up existing meter if any
    if (channel.meter) {
      channel?.meter.dispose();
    }

    // Create new meter
    channel.meter = this.createMeter(config);

    // Connect meter after the channel's processing chain
    const lastNode = this.actions.getOutputNode(channel.id);
    lastNode.connect(channel.meter);

    // Initialize meter state
    channel.state.meter = {
      config,
      data: {
        values: config.channels === 1 ? 0 : new Array(config.channels).fill(0),
      },
      isEnabled: true,
    };
  }

  private startMeterUpdates() {
    if (this.meterUpdateInterval) return;

    const updateMeters = () => {
      this.channels.forEach((channel) => {
        if (channel.meter && channel.state.meter?.isEnabled) {
          channel.state.meter.data = {
            values: channel.meter.getValue(),
          };
        }
      });

      // Update master channel meter
      if (
        this.masterChannel.meter &&
        this.masterChannel.state.meter?.isEnabled
      ) {
        this.masterChannel.state.meter.data = {
          values: this.masterChannel.meter.getValue(),
        };
      }

      this.meterUpdateInterval = requestAnimationFrame(updateMeters);
    };

    this.meterUpdateInterval = requestAnimationFrame(updateMeters);
  }

  private stopMeterUpdates() {
    if (this.meterUpdateInterval) {
      cancelAnimationFrame(this.meterUpdateInterval);
      this.meterUpdateInterval = null;
    }
  }

  readonly actions: MixerActions = {
    createChannel: (name: string): string => {
      const state = this.createInitialChannelState(name);
      const channel = this.createChannel(state);

      this.channels.set(state.id, channel);
      this.state.channels.push(state);

      return state.id;
    },

    removeChannel: (id: string): void => {
      const channel = this.channels.get(id);
      if (!channel) return;

      // Clean up audio nodes
      channel.channel.dispose();
      channel.effects.forEach((effect) => effect.dispose());
      channel.sends.forEach((send) => send.dispose());

      // Remove from state
      this.channels.delete(id);
      this.state.channels = this.state.channels.filter((c) => c.id !== id);
    },

    updateChannel: (id: string, updates: Partial<MixerChannelState>): void => {
      const channel = this.channels.get(id);
      if (!channel) return;

      // Update audio parameters
      if (updates.volume !== undefined)
        channel.channel.volume.value = updates.volume;
      if (updates.pan !== undefined) channel.channel.pan.value = updates.pan;
      if (updates.mute !== undefined) channel.channel.mute = updates.mute;

      // Update state
      channel.state = { ...channel.state, ...updates };
      this.state.channels = this.state.channels.map((c) =>
        c.id === id ? channel.state : c,
      );
    },

    addEffect: (
      channelId: string,
      type: EffectName,
      options: any = { wet: 1 },
    ): string => {
      const channel = this.channels.get(channelId);
      if (!channel) throw new Error(`Channel ${channelId} not found`);

      const effectState: EffectState = {
        id: `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        bypass: false,
        options,
      };

      const effect = this.createEffect(type, options);
      channel.effects.set(effectState.id, effect);
      channel.state.effects.push(effectState);

      this.updateChannelRouting(channel);
      return effectState.id;
    },

    removeEffect: (channelId: string, effectId: string): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.get(effectId);
      if (effect) {
        effect.dispose();
        channel.effects.delete(effectId);
        channel.state.effects = channel.state.effects.filter(
          (e) => e.id !== effectId,
        );
        this.updateChannelRouting(channel);
      }
    },

    updateEffect: (
      channelId: string,
      effectId: string,
      updates: Partial<EffectOptions>,
    ): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.get(effectId);
      const effectState = channel.state.effects.find((e) => e.id === effectId);
      if (!effect || !effectState) return;

      // Update effect parameters
      Object.entries(updates).forEach(([param, value]) => {
        if (param in effect) {
          (effect as any)[param] = value;
        }
      });

      // Update state
      effectState.options = { ...effectState.options, ...updates };
    },

    bypassEffect: (
      channelId: string,
      effectId: string,
      bypass: boolean,
    ): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      const effectState = channel.state.effects.find((e) => e.id === effectId);
      if (effectState) {
        effectState.bypass = bypass;
        this.updateChannelRouting(channel);
      }
    },

    createSend: (
      fromId: string,
      toId: string,
      gain: NormalRange = 1,
    ): string => {
      const fromChannel = this.channels.get(fromId);
      const toChannel = this.channels.get(toId);
      if (!fromChannel || !toChannel) throw new Error("Invalid channel IDs");

      const sendId = `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const send = new Tone.Gain(gain);
      send.connect(toChannel.channel);

      fromChannel.sends.set(sendId, send);
      fromChannel.state.sends.push({
        id: sendId,
        targetId: toId,
        gain,
      });

      this.updateChannelRouting(fromChannel);
      return sendId;
    },

    removeSend: (channelId: string, sendId: string): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      const send = channel.sends.get(sendId);
      if (send) {
        send.dispose();
        channel.sends.delete(sendId);
        channel.state.sends = channel.state.sends.filter(
          (s) => s.id !== sendId,
        );
        this.updateChannelRouting(channel);
      }
    },

    updateSend: (
      channelId: string,
      sendId: string,
      gain: NormalRange,
    ): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      const send = channel.sends.get(sendId);
      const sendState = channel.state.sends.find((s) => s.id === sendId);
      if (send && sendState) {
        send.gain.value = gain;
        sendState.gain = gain;
      }
    },

    dispose: (): void => {
      this.stopMeterUpdates();

      // Clean up master channel
      this.masterChannel.channel.dispose();
      this.masterChannel.effects.forEach((effect) => effect.dispose());
      this.masterChannel.sends.forEach((send) => send.dispose());
      this.masterChannel.meter?.dispose();

      // Clean up other channels
      this.channels.forEach((channel) => {
        channel.channel.dispose();
        channel.effects.forEach((effect) => effect.dispose());
        channel.sends.forEach((send) => send.dispose());
        channel.meter?.dispose();
      });

      this.channels.clear();
      this.state.channels = [];
    },

    enableMetering: (
      channelId: string,
      config?: Partial<MeterConfig>,
    ): void => {
      const channel = this.channels.get(channelId);
      if (!channel) return;

      this.setupChannelMetering(channel, {
        ...this.defaultMeterConfig,
        ...config,
      });
      this.startMeterUpdates();
    },

    disableMetering: (channelId: string): void => {
      const channel = this.channels.get(channelId);
      if (!channel?.meter) return;

      channel.meter.dispose();
      channel.meter = undefined;
      if (channel.state.meter) {
        channel.state.meter.isEnabled = false;
      }

      // Stop global updates if no meters are enabled
      const hasEnabledMeters = Array.from(this.channels.values()).some(
        (ch) => ch.state.meter?.isEnabled,
      );

      if (!hasEnabledMeters) {
        this.stopMeterUpdates();
      }
    },

    getMeterData: (channelId: string): MeterData | null => {
      const channel = this.channels.get(channelId);
      return channel?.state.meter?.data ?? null;
    },

    updateMeterConfig: (
      channelId: string,
      config: Partial<MeterConfig>,
    ): void => {
      const channel = this.channels.get(channelId);
      if (!channel?.state.meter) return;

      const newConfig = {
        ...channel.state.meter.config,
        ...config,
      };

      this.setupChannelMetering(channel, newConfig);
    },
    getInputNode: (channelId: string): Tone.ToneAudioNode => {
      if (channelId === this.masterChannel.id) {
        return this.masterChannel.channel;
      }
      const channel = this.channels.get(channelId);
      return channel ? channel.channel : this.masterChannel.channel;
    },

    getOutputNode: (channelId: string): Tone.ToneAudioNode => {
      if (channelId === this.masterChannel.id) {
        return this.masterChannel.channel;
      }
      const channel = this.channels.get(channelId);
      if (!channel) return this.masterChannel.channel;

      const lastEffect = Array.from(channel.effects.values()).pop();
      return lastEffect ?? channel.channel;
    },
  };

  toJSON(): MixerState {
    return this.state;
  }

  fromJSON(state: MixerState): void {
    // Clean up existing channels
    this.actions.dispose();

    // Recreate master channel state
    this.state.master = state.master;

    // Recreate channels
    state.channels.forEach((channelState) => {
      const id = channelState.id;
      const channel = this.createChannel(channelState);
      this.channels.set(id, channel);

      // Recreate effects
      channelState.effects.forEach((effectState) => {
        const effect = this.createEffect(effectState.type, effectState.options);
        channel.effects.set(effectState.id, effect);
      });

      // Recreate sends
      channelState.sends.forEach((sendState) => {
        const send = new Tone.Gain(sendState.gain);
        channel.sends.set(sendState.id, send);
      });

      this.updateChannelRouting(channel);
    });

    this.state = state;
  }
}
