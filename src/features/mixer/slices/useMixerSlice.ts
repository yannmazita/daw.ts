// src/features/mixer/slices/useMixerSlice.ts

import { StateCreator } from "zustand";
import {
  MixerState,
  MixerActions,
  MixerChannelState,
  MeterConfig,
} from "@/core/interfaces/mixer";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { EffectName, EffectOptions } from "@/core/types/effect";
import { NormalRange } from "tone/build/esm/core/type/Units";

export interface MixerSlice extends MixerState, MixerActions {}

export const createMixerSlice: StateCreator<MixerSlice, [], [], MixerSlice> = (
  set,
  get,
) => {
  return {
    // Initial state from mixer manager
    ...mixerManager.state,

    // Channel Management
    createChannel: (name: string): string => {
      try {
        return mixerManager.actions.createChannel(name);
      } catch (error) {
        console.error("Error creating channel:", error);
        throw error;
      }
    },

    removeChannel: (id: string): void => {
      try {
        mixerManager.actions.removeChannel(id);
      } catch (error) {
        console.error("Error removing channel:", error);
        throw error;
      }
    },

    updateChannel: (id: string, updates: Partial<MixerChannelState>): void => {
      try {
        mixerManager.actions.updateChannel(id, updates);
      } catch (error) {
        console.error("Error updating channel:", error);
        throw error;
      }
    },

    // Effect Management
    addEffect: (
      channelId: string,
      type: EffectName,
      options?: EffectOptions,
    ): string => {
      try {
        return mixerManager.actions.addEffect(channelId, type, options);
      } catch (error) {
        console.error("Error adding effect:", error);
        throw error;
      }
    },

    removeEffect: (channelId: string, effectId: string): void => {
      try {
        mixerManager.actions.removeEffect(channelId, effectId);
      } catch (error) {
        console.error("Error removing effect:", error);
        throw error;
      }
    },

    updateEffect: (
      channelId: string,
      effectId: string,
      updates: Partial<EffectOptions>,
    ): void => {
      try {
        mixerManager.actions.updateEffect(channelId, effectId, updates);
      } catch (error) {
        console.error("Error updating effect:", error);
        throw error;
      }
    },

    bypassEffect: (
      channelId: string,
      effectId: string,
      bypass: boolean,
    ): void => {
      try {
        mixerManager.actions.bypassEffect(channelId, effectId, bypass);
      } catch (error) {
        console.error("Error bypassing effect:", error);
        throw error;
      }
    },

    // Send Management
    createSend: (fromId: string, toId: string, gain?: NormalRange): string => {
      try {
        return mixerManager.actions.createSend(fromId, toId, gain);
      } catch (error) {
        console.error("Error creating send:", error);
        throw error;
      }
    },

    removeSend: (channelId: string, sendId: string): void => {
      try {
        mixerManager.actions.removeSend(channelId, sendId);
      } catch (error) {
        console.error("Error removing send:", error);
        throw error;
      }
    },

    updateSend: (
      channelId: string,
      sendId: string,
      gain: NormalRange,
    ): void => {
      try {
        mixerManager.actions.updateSend(channelId, sendId, gain);
      } catch (error) {
        console.error("Error updating send:", error);
        throw error;
      }
    },

    // Metering
    enableMetering: (channelId: string): void => {
      try {
        mixerManager.actions.enableMetering(channelId);
      } catch (error) {
        console.error("Error enabling metering:", error);
        throw error;
      }
    },

    disableMetering: (channelId: string): void => {
      try {
        mixerManager.actions.disableMetering(channelId);
      } catch (error) {
        console.error("Error disabling metering:", error);
        throw error;
      }
    },

    getMeterData: (channelId: string) => {
      try {
        return mixerManager.actions.getMeterData(channelId);
      } catch (error) {
        console.error("Error getting meter data:", error);
        throw error;
      }
    },

    updateMeterConfig: (
      channelId: string,
      config: Partial<MeterConfig>,
    ): void => {
      try {
        mixerManager.actions.updateMeterConfig(channelId, config);
      } catch (error) {
        console.error("Error updating meter config:", error);
        throw error;
      }
    },

    // Audio Routing
    getInputNode: (channelId: string) => {
      try {
        return mixerManager.actions.getInputNode(channelId);
      } catch (error) {
        console.error("Error getting input node:", error);
        throw error;
      }
    },

    getOutputNode: (channelId: string) => {
      try {
        return mixerManager.actions.getOutputNode(channelId);
      } catch (error) {
        console.error("Error getting output node:", error);
        throw error;
      }
    },

    // Cleanup
    dispose: (): void => {
      try {
        mixerManager.actions.dispose();
      } catch (error) {
        console.error("Error disposing mixer:", error);
        throw error;
      }
    },
  };
};
