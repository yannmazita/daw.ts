// src/features/mixer/services/AudioGraphManager.ts

import * as Tone from "tone";
import { ChannelManager } from "./ChannelManager";
import { EffectManager } from "./EffectManager";
import { EffectName } from "@/core/enums/EffectName";

export class AudioGraphManager {
  private channelManager: ChannelManager;
  private effectManager: EffectManager;
  private channelEffects: Map<string, string[]>; // channelId -> ordered effect IDs

  constructor() {
    this.channelManager = new ChannelManager();
    this.effectManager = new EffectManager();
    this.channelEffects = new Map();
  }

  addChannel(id: string): void {
    this.channelManager.addChannel(id);
    this.channelEffects.set(id, []);
  }

  removeChannel(id: string): void {
    // Clean up effects first
    const effects = this.channelEffects.get(id) ?? [];
    effects.forEach((effectId) => {
      this.effectManager.removeEffect(effectId);
    });

    // Remove channel
    this.channelManager.removeChannel(id);
    this.channelEffects.delete(id);
  }

  addEffect(channelId: string, effectName: EffectName): string {
    const effectId = `effect_${Date.now()}`;

    // Create effect
    this.effectManager.addEffect(effectId, effectName);

    // Add to channel's effect list
    const effects = this.channelEffects.get(channelId) ?? [];
    effects.push(effectId);
    this.channelEffects.set(channelId, effects);

    // Rebuild chain
    this.rebuildChannelChain(channelId);

    return effectId;
  }

  removeEffect(channelId: string, effectId: string): void {
    const effects = this.channelEffects.get(channelId) ?? [];
    this.channelEffects.set(
      channelId,
      effects.filter((id) => id !== effectId),
    );
    this.effectManager.removeEffect(effectId);
    this.rebuildChannelChain(channelId);
  }

  updateChannel(
    id: string,
    parameters: {
      volume?: number;
      pan?: number;
      mute?: boolean;
      solo?: boolean;
    },
  ): void {
    this.channelManager.updateChannel(id, parameters);
  }

  createSend(fromId: string, toId: string, level: number): string {
    return this.channelManager.createSend(fromId, toId, level);
  }

  updateSend(fromId: string, toId: string, level: number): void {
    this.channelManager.updateSend(fromId, toId, level);
  }

  removeSend(fromId: string, toId: string): void {
    this.channelManager.removeSend(fromId, toId);
  }

  private rebuildChannelChain(channelId: string): void {
    const channel = this.channelManager.getChannel(channelId);
    if (!channel) return;

    // Disconnect channel
    this.channelManager.disconnectChannel(channelId);

    // Get effect chain
    const effectIds = this.channelEffects.get(channelId) ?? [];

    // Build chain
    let currentNode: Tone.ToneAudioNode = channel;

    effectIds.forEach((effectId) => {
      const effect = this.effectManager.getEffect(effectId);
      if (effect) {
        currentNode = currentNode.chain(effect);
      }
    });

    // Connect to destination
    this.channelManager.connectChannel(channelId);
  }

  dispose(): void {
    this.effectManager.dispose();
    this.channelManager.dispose();
    this.channelEffects.clear();
  }

  // Helper methods
  getChannel(id: string): Tone.Channel | undefined {
    return this.channelManager.getChannel(id);
  }

  getMeter(id: string): Tone.Meter | undefined {
    return this.channelManager.getMeter(id);
  }

  getEffect(id: string): Tone.ToneAudioNode | undefined {
    return this.effectManager.getEffect(id);
  }

  reorderEffects(channelId: string, effectIds: string[]): void {
    const currentEffects = this.channelEffects.get(channelId) ?? [];

    // Verify all effects exist
    if (
      effectIds.length !== currentEffects.length ||
      !effectIds.every((id) => currentEffects.includes(id))
    ) {
      throw new Error("Invalid effect reordering");
    }

    this.channelEffects.set(channelId, effectIds);
    this.rebuildChannelChain(channelId);
  }

  cleanup() {
    Tone.getTransport().stop();
    this.channelManager.dispose();
    this.effectManager.dispose();
    this.channelEffects.clear();

    Tone.getContext().dispose();
    Tone.setContext(new Tone.Context());
  }
}
