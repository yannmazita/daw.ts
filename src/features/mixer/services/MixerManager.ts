// src/features/mixer/services/MixerManager.ts

import * as Tone from "tone";
import {
  Mixer,
  MixerState,
  MixerChannel,
  MixerChannelState,
  MixerActions,
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

export class MixerManager implements Mixer {
  private _master: Tone.Channel;
  private _channels: Map<string, MixerChannel>;
  private _state: MixerState;

  constructor() {
    this._master = new Tone.Channel().toDestination();
    this._channels = new Map();
    this._state = {
      master: this.createInitialChannelState("master"),
      channels: [],
    };
  }

  get state(): MixerState {
    return this._state;
  }

  get master(): Tone.Channel {
    return this._master;
  }

  get channels(): Map<string, MixerChannel> {
    return this._channels;
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
    };
  }

  private createChannel(state: MixerChannelState): MixerChannel {
    const channel = new Tone.Channel({
      volume: state.volume,
      pan: state.pan,
      mute: state.mute,
    });

    // Connect to master by default
    channel.connect(this._master);

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
    lastNode.connect(this._master);
  }

  readonly actions: MixerActions = {
    createChannel: (name: string): string => {
      const state = this.createInitialChannelState(name);
      const channel = this.createChannel(state);

      this._channels.set(state.id, channel);
      this._state.channels.push(state);

      return state.id;
    },

    removeChannel: (id: string): void => {
      const channel = this._channels.get(id);
      if (!channel) return;

      // Clean up audio nodes
      channel.channel.dispose();
      channel.effects.forEach((effect) => effect.dispose());
      channel.sends.forEach((send) => send.dispose());

      // Remove from state
      this._channels.delete(id);
      this._state.channels = this._state.channels.filter((c) => c.id !== id);
    },

    updateChannel: (id: string, updates: Partial<MixerChannelState>): void => {
      const channel = this._channels.get(id);
      if (!channel) return;

      // Update audio parameters
      if (updates.volume !== undefined)
        channel.channel.volume.value = updates.volume;
      if (updates.pan !== undefined) channel.channel.pan.value = updates.pan;
      if (updates.mute !== undefined) channel.channel.mute = updates.mute;

      // Update state
      channel.state = { ...channel.state, ...updates };
      this._state.channels = this._state.channels.map((c) =>
        c.id === id ? channel.state : c,
      );
    },

    addEffect: (
      channelId: string,
      type: EffectName,
      options: any = { wet: 1 },
    ): string => {
      const channel = this._channels.get(channelId);
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
      const channel = this._channels.get(channelId);
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
      const channel = this._channels.get(channelId);
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
      const channel = this._channels.get(channelId);
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
      const fromChannel = this._channels.get(fromId);
      const toChannel = this._channels.get(toId);
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
      const channel = this._channels.get(channelId);
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
      const channel = this._channels.get(channelId);
      if (!channel) return;

      const send = channel.sends.get(sendId);
      const sendState = channel.state.sends.find((s) => s.id === sendId);
      if (send && sendState) {
        send.gain.value = gain;
        sendState.gain = gain;
      }
    },

    dispose: (): void => {
      this._master.dispose();
      this._channels.forEach((channel) => {
        channel.channel.dispose();
        channel.effects.forEach((effect) => effect.dispose());
        channel.sends.forEach((send) => send.dispose());
      });
      this._channels.clear();
      this._state.channels = [];
    },
  };

  getInputNode(channelId: string): Tone.ToneAudioNode {
    const channel = this._channels.get(channelId);
    return channel ? channel.channel : this._master;
  }

  getOutputNode(channelId: string): Tone.ToneAudioNode {
    const channel = this._channels.get(channelId);
    if (!channel) return this._master;

    const lastEffect = Array.from(channel.effects.values()).pop();
    return lastEffect ?? channel.channel;
  }

  toJSON(): MixerState {
    return this._state;
  }

  fromJSON(state: MixerState): void {
    // Clean up existing channels
    this.actions.dispose();

    // Recreate master channel state
    this._state.master = state.master;

    // Recreate channels
    state.channels.forEach((channelState) => {
      const id = channelState.id;
      const channel = this.createChannel(channelState);
      this._channels.set(id, channel);

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

    this._state = state;
  }
}
