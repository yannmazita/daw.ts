// src/common/slices/useTransportSlice.ts

import { StateCreator } from "zustand";
import { TransportState, TransportActions } from "@/core/interfaces/transport";
import { transportManager } from "@/common/services/transportManagerInstance";
import { PlaybackMode } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";

export interface TransportSlice extends TransportState, TransportActions {}

export const createTransportSlice: StateCreator<
  TransportSlice,
  [],
  [],
  TransportSlice
> = (set, get) => {
  return {
    // Initial state from transport manager
    ...transportManager.getState(),

    // Playback Control
    play: async (startTime?: Time) => {
      try {
        await transportManager.actions.play(startTime);
      } catch (error) {
        console.error("Error starting playback:", error);
        // Ensure we stop on error
        get().stop();
        throw error;
      }
    },

    stop: () => {
      try {
        transportManager.actions.stop();
      } catch (error) {
        console.error("Error stopping playback:", error);
        throw error;
      }
    },

    pause: () => {
      try {
        transportManager.actions.pause();
      } catch (error) {
        console.error("Error pausing playback:", error);
        throw error;
      }
    },

    // Position Control
    seekTo: (position: Time) => {
      try {
        transportManager.actions.seekTo(position);
      } catch (error) {
        console.error("Error seeking to position:", error);
        throw error;
      }
    },

    // Transport Settings
    setBpm: (bpm: number) => {
      try {
        if (bpm < 20 || bpm > 300) {
          throw new Error("BPM must be between 20 and 300");
        }
        transportManager.actions.setBpm(bpm);
      } catch (error) {
        console.error("Error setting BPM:", error);
        throw error;
      }
    },

    setTimeSignature: (numerator: number, denominator: number) => {
      try {
        if (numerator < 1 || denominator < 1) {
          throw new Error("Invalid time signature values");
        }
        transportManager.actions.setTimeSignature(numerator, denominator);
      } catch (error) {
        console.error("Error setting time signature:", error);
        throw error;
      }
    },

    setSwing: (amount: number) => {
      try {
        if (amount < 0 || amount > 1) {
          throw new Error("Swing amount must be between 0 and 1");
        }
        transportManager.actions.setSwing(amount);
      } catch (error) {
        console.error("Error setting swing:", error);
        throw error;
      }
    },

    // Loop Control
    setLoop: (enabled: boolean, start?: Time, end?: Time) => {
      try {
        transportManager.actions.setLoop(enabled, start, end);
      } catch (error) {
        console.error("Error setting loop points:", error);
        throw error;
      }
    },

    // Mode Control
    setMode: async (mode: PlaybackMode) => {
      try {
        await transportManager.actions.setMode(mode);
      } catch (error) {
        console.error("Error setting playback mode:", error);
        throw error;
      }
    },

    // Tap Tempo
    tap: () => {
      try {
        return transportManager.actions.tap();
      } catch (error) {
        console.error("Error processing tap tempo:", error);
        throw error;
      }
    },

    resetTapTempo: () => {
      try {
        transportManager.actions.resetTapTempo();
      } catch (error) {
        console.error("Error resetting tap tempo:", error);
        throw error;
      }
    },
  };
};
