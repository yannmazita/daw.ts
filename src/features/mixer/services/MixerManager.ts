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
import { BaseManager } from "@/common/services/BaseManager";

export class MixerManager extends BaseManager<MixerState> {
  private readonly runtimeChannels: Map<string, MixerChannel>;
  private readonly defaultMeterConfig: MeterConfig = {
    smoothing: 0.8,
    normalRange: false,
    channels: 2,
  };
  private meterUpdateInterval: number | null = null;

  constructor() {
    // Initialize with default state
    const masterState = MixerManager.createInitialChannelState("master");
    super({
      master: masterState,
      channels: [],
    });

    // Initialize runtime objects
    this.runtimeChannels = new Map();

    // Create master channel
    const masterChannel = this.createRuntimeChannel(masterState);
    masterChannel.channel.toDestination();
    this.runtimeChannels.set(masterState.id, masterChannel);
  }

  private static createInitialChannelState(name: string): MixerChannelState {
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

  private createRuntimeChannel(state: MixerChannelState): MixerChannel {
    const channel = new Tone.Channel({
      volume: state.volume,
      pan: state.pan,
      mute: state.mute,
    });

    // Connect to master by default
    const masterChannel = this.runtimeChannels.get(this.state.master.id);
    if (masterChannel) {
      channel.connect(masterChannel.channel);
    }

    return {
      id: state.id,
      state: { ...state },
      channel,
      effects: new Map(),
      sends: new Map(),
    };
  }

  private createEffect(
    type: EffectName,
    options: any = { wet: 1 },
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

  private updateChannelRouting(channelId: string): void {
    const channel = this.runtimeChannels.get(channelId);
    if (!channel) return;

    // Disconnect everything
    channel.channel.disconnect();

    // Rebuild effect chain
    let lastNode: Tone.ToneAudioNode = channel.channel;
    const sortedEffects = Array.from(channel.effects.entries()).sort((a, b) => {
      const indexA = channel.state.effects.findIndex((e) => e.id === a[0]);
      const indexB = channel.state.effects.findIndex((e) => e.id === b[0]);
      return indexA - indexB;
    });

    // Connect effects
    for (const [, effect] of sortedEffects) {
      lastNode.connect(effect);
      lastNode = effect;
    }

    // Connect sends
    for (const [, send] of channel.sends) {
      lastNode.connect(send);
    }

    // Connect to master
    const masterChannel = this.runtimeChannels.get(this.state.master.id);
    if (masterChannel) {
      lastNode.connect(masterChannel.channel);
    }
  }

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
    channelId: string,
    config: MeterConfig = this.defaultMeterConfig,
  ): void {
    const channel = this.runtimeChannels.get(channelId);
    if (!channel) return;

    // Clean up existing meter if any
    if (channel.meter) {
      channel.meter.dispose();
    }

    // Create new meter
    channel.meter = this.createMeter(config);

    // Connect meter after the channel's processing chain
    const lastNode = this.actions.getOutputNode(channelId);
    lastNode.connect(channel.meter);

    // Update state
    const updatedState = {
      ...channel.state,
      meter: {
        config,
        data: {
          values:
            config.channels === 1 ? 0 : new Array(config.channels).fill(0),
        },
        isEnabled: true,
      },
    };

    channel.state = updatedState;

    // Update store state
    if (channelId === this.state.master.id) {
      this.updateState({ master: updatedState });
    } else {
      this.updateState({
        channels: this.state.channels.map((c) =>
          c.id === channelId ? updatedState : c,
        ),
      });
    }
  }

  private startMeterUpdates(): void {
    if (this.meterUpdateInterval) return;

    const updateMeters = () => {
      this.runtimeChannels.forEach((channel) => {
        if (channel.meter && channel.state.meter?.isEnabled) {
          const meterData = {
            values: channel.meter.getValue(),
          };

          // Update runtime state
          if (channel.state.meter) {
            channel.state.meter.data = meterData;
          }

          // Update store state
          if (channel.id === this.state.master.id) {
            this.updateState({
              master: {
                ...this.state.master,
                meter: {
                  ...this.state.master.meter,
                  data: meterData,
                },
              },
            });
          } else {
            this.updateState({
              channels: this.state.channels.map((c) =>
                c.id === channel.id
                  ? {
                      ...c,
                      meter: {
                        ...c.meter,
                        data: meterData,
                      },
                    }
                  : c,
              ),
            });
          }
        }
      });

      this.meterUpdateInterval = requestAnimationFrame(updateMeters);
    };

    this.meterUpdateInterval = requestAnimationFrame(updateMeters);
  }

  private stopMeterUpdates(): void {
    if (this.meterUpdateInterval) {
      cancelAnimationFrame(this.meterUpdateInterval);
      this.meterUpdateInterval = null;
    }
  }

  public readonly actions: MixerActions = {
    createChannel: (name: string): string => {
      const state = MixerManager.createInitialChannelState(name);
      const channel = this.createRuntimeChannel(state);

      // Update runtime state
      this.runtimeChannels.set(state.id, channel);

      // Update store state
      this.updateState({
        channels: [...this.state.channels, state],
      });

      return state.id;
    },

    removeChannel: (id: string): void => {
      const channel = this.runtimeChannels.get(id);
      if (!channel) return;

      // Clean up audio nodes
      channel.channel.dispose();
      channel.effects.forEach((effect) => effect.dispose());
      channel.sends.forEach((send) => send.dispose());
      channel.meter?.dispose();

      // Update runtime state
      this.runtimeChannels.delete(id);

      // Update store state
      this.updateState({
        channels: this.state.channels.filter((c) => c.id !== id),
      });
    },

    updateChannel: (id: string, updates: Partial<MixerChannelState>): void => {
      const channel = this.runtimeChannels.get(id);
      if (!channel) return;

      // Update audio parameters
      if (updates.volume !== undefined) {
        channel.channel.volume.value = updates.volume;
      }
      if (updates.pan !== undefined) {
        channel.channel.pan.value = updates.pan;
      }
      if (updates.mute !== undefined) {
        channel.channel.mute = updates.mute;
      }

      // Update runtime state
      const updatedState = { ...channel.state, ...updates };
      channel.state = updatedState;

      // Update store state
      if (id === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === id ? updatedState : c,
          ),
        });
      }
    },

    addEffect: (
      channelId: string,
      type: EffectName,
      options: any = { wet: 1 },
    ): string => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) throw new Error(`Channel ${channelId} not found`);

      const effectState: EffectState = {
        id: `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        bypass: false,
        options,
      };

      // Create and add effect to runtime state
      const effect = this.createEffect(type, options);
      channel.effects.set(effectState.id, effect);

      // Update runtime state
      const updatedState = {
        ...channel.state,
        effects: [...channel.state.effects, effectState],
      };
      channel.state = updatedState;

      // Update store state
      if (channelId === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === channelId ? updatedState : c,
          ),
        });
      }

      this.updateChannelRouting(channelId);
      return effectState.id;
    },

    removeEffect: (channelId: string, effectId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.get(effectId);
      if (effect) {
        // Clean up effect
        effect.dispose();
        channel.effects.delete(effectId);

        // Update runtime state
        const updatedState = {
          ...channel.state,
          effects: channel.state.effects.filter((e) => e.id !== effectId),
        };
        channel.state = updatedState;

        // Update store state
        if (channelId === this.state.master.id) {
          this.updateState({ master: updatedState });
        } else {
          this.updateState({
            channels: this.state.channels.map((c) =>
              c.id === channelId ? updatedState : c,
            ),
          });
        }

        this.updateChannelRouting(channelId);
      }
    },

    updateEffect: (
      channelId: string,
      effectId: string,
      updates: Partial<EffectOptions>,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const effect = channel.effects.get(effectId);
      if (!effect) return;

      // Update effect parameters
      Object.entries(updates).forEach(([param, value]) => {
        if (param in effect) {
          (effect as any)[param] = value;
        }
      });

      // Update runtime state
      const updatedState = {
        ...channel.state,
        effects: channel.state.effects.map((e) =>
          e.id === effectId
            ? { ...e, options: { ...e.options, ...updates } }
            : e,
        ),
      };
      channel.state = updatedState;

      // Update store state
      if (channelId === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === channelId ? updatedState : c,
          ),
        });
      }
    },

    bypassEffect: (
      channelId: string,
      effectId: string,
      bypass: boolean,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      // Update runtime state
      const updatedState = {
        ...channel.state,
        effects: channel.state.effects.map((e) =>
          e.id === effectId ? { ...e, bypass } : e,
        ),
      };
      channel.state = updatedState;

      // Update store state
      if (channelId === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === channelId ? updatedState : c,
          ),
        });
      }

      this.updateChannelRouting(channelId);
    },

    createSend: (
      fromId: string,
      toId: string,
      gain: NormalRange = 1,
    ): string => {
      const fromChannel = this.runtimeChannels.get(fromId);
      const toChannel = this.runtimeChannels.get(toId);
      if (!fromChannel || !toChannel) throw new Error("Invalid channel IDs");

      const sendId = `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Create and add send to runtime state
      const send = new Tone.Gain(gain);
      send.connect(toChannel.channel);
      fromChannel.sends.set(sendId, send);

      // Update runtime state
      const updatedState = {
        ...fromChannel.state,
        sends: [
          ...fromChannel.state.sends,
          {
            id: sendId,
            targetId: toId,
            gain,
          },
        ],
      };
      fromChannel.state = updatedState;

      // Update store state
      if (fromId === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === fromId ? updatedState : c,
          ),
        });
      }

      this.updateChannelRouting(fromId);
      return sendId;
    },

    removeSend: (channelId: string, sendId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const send = channel.sends.get(sendId);
      if (send) {
        // Clean up send
        send.dispose();
        channel.sends.delete(sendId);

        // Update runtime state
        const updatedState = {
          ...channel.state,
          sends: channel.state.sends.filter((s) => s.id !== sendId),
        };
        channel.state = updatedState;

        // Update store state
        if (channelId === this.state.master.id) {
          this.updateState({ master: updatedState });
        } else {
          this.updateState({
            channels: this.state.channels.map((c) =>
              c.id === channelId ? updatedState : c,
            ),
          });
        }

        this.updateChannelRouting(channelId);
      }
    },

    updateSend: (
      channelId: string,
      sendId: string,
      gain: NormalRange,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) return;

      const send = channel.sends.get(sendId);
      if (send) {
        // Update send gain
        send.gain.value = gain;

        // Update runtime state
        const updatedState = {
          ...channel.state,
          sends: channel.state.sends.map((s) =>
            s.id === sendId ? { ...s, gain } : s,
          ),
        };
        channel.state = updatedState;

        // Update store state
        if (channelId === this.state.master.id) {
          this.updateState({ master: updatedState });
        } else {
          this.updateState({
            channels: this.state.channels.map((c) =>
              c.id === channelId ? updatedState : c,
            ),
          });
        }
      }
    },

    enableMetering: (
      channelId: string,
      config?: Partial<MeterConfig>,
    ): void => {
      this.setupChannelMetering(channelId, {
        ...this.defaultMeterConfig,
        ...config,
      });
      this.startMeterUpdates();
    },

    disableMetering: (channelId: string): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel?.meter) return;

      // Clean up meter
      channel.meter.dispose();
      channel.meter = undefined;

      // Update runtime state
      const updatedState = {
        ...channel.state,
        meter: channel.state.meter
          ? { ...channel.state.meter, isEnabled: false }
          : null,
      };
      channel.state = updatedState;

      // Update store state
      if (channelId === this.state.master.id) {
        this.updateState({ master: updatedState });
      } else {
        this.updateState({
          channels: this.state.channels.map((c) =>
            c.id === channelId ? updatedState : c,
          ),
        });
      }

      // Stop global updates if no meters are enabled
      const hasEnabledMeters = Array.from(this.runtimeChannels.values()).some(
        (ch) => ch.state.meter?.isEnabled,
      );

      if (!hasEnabledMeters) {
        this.stopMeterUpdates();
      }
    },

    getMeterData: (channelId: string): MeterData | null => {
      const channel = this.runtimeChannels.get(channelId);
      return channel?.state.meter?.data ?? null;
    },

    updateMeterConfig: (
      channelId: string,
      config: Partial<MeterConfig>,
    ): void => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel?.state.meter) return;

      this.setupChannelMetering(channelId, {
        ...channel.state.meter.config,
        ...config,
      });
    },

    getInputNode: (channelId: string): Tone.ToneAudioNode => {
      const channel = this.runtimeChannels.get(channelId);
      return (
        channel?.channel ??
        this.runtimeChannels.get(this.state.master.id)?.channel
      );
    },

    getOutputNode: (channelId: string): Tone.ToneAudioNode => {
      const channel = this.runtimeChannels.get(channelId);
      if (!channel) {
        return this.runtimeChannels.get(this.state.master.id)?.channel;
      }

      const lastEffect = Array.from(channel.effects.values()).pop();
      return lastEffect ?? channel.channel;
    },

    dispose: (): void => {
      this.stopMeterUpdates();

      // Clean up all runtime channels
      this.runtimeChannels.forEach((channel) => {
        channel.channel.dispose();
        channel.effects.forEach((effect) => effect.dispose());
        channel.sends.forEach((send) => send.dispose());
        channel.meter?.dispose();
      });

      this.runtimeChannels.clear();

      // Reset store state
      this.updateState({
        master: MixerManager.createInitialChannelState("master"),
        channels: [],
      });
    },
  };

  public toJSON(): MixerState {
    return this.state;
  }

  public fromJSON(state: MixerState): void {
    // Clean up existing channels
    this.actions.dispose();

    // Recreate master channel
    const masterChannel = this.createRuntimeChannel(state.master);
    masterChannel.channel.toDestination();
    this.runtimeChannels.set(state.master.id, masterChannel);

    // Recreate regular channels
    state.channels.forEach((channelState) => {
      const channel = this.createRuntimeChannel(channelState);
      this.runtimeChannels.set(channelState.id, channel);

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

      this.updateChannelRouting(channelState.id);
    });

    // Update store state
    this.updateState(state);
  }
}
