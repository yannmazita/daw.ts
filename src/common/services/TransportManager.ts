// src/common/services/TransportManager.ts

import * as Tone from "tone";
import { PlaybackMode } from "@/core/types/common";
import { TransportState, TransportActions } from "@/core/interfaces/transport";
import { Subdivision, Time } from "tone/build/esm/core/type/Units";
import { BaseManager } from "./BaseManager";

export class TransportManager extends BaseManager<TransportState> {
  private modeHandlers: Map<PlaybackMode, () => void>;
  private cleanupHandlers: Map<PlaybackMode, () => void>;
  private tapTimes: number[] = [];
  private tapResetTimeout: NodeJS.Timeout | null = null;
  private readonly TAP_TIMEOUT = 2000; // 2 seconds
  private readonly MAX_TAP_SAMPLES = 4;

  constructor() {
    // Initialize state
    super({
      bpm: 120,
      timeSignature: [4, 4],
      swing: 0,
      swingSubdivision: "8n" as Subdivision,
      position: 0,
      isPlaying: false,
      isLooping: false,
      loopStart: "0:0:0",
      loopEnd: "4:0:0",
      mode: PlaybackMode.PATTERN,
    });

    // Initialize mode handlers
    this.modeHandlers = new Map();
    this.cleanupHandlers = new Map();

    // Configure initial transport settings
    this.configureTransport();
  }

  private configureTransport(): void {
    const transport = Tone.getTransport();
    transport.bpm.value = this.state.bpm;
    transport.timeSignature = this.state.timeSignature;
    transport.swing = this.state.swing;
    transport.swingSubdivision = this.state.swingSubdivision;

    // Set up transport event handlers
    transport.on("start", () => this.updateState({ isPlaying: true }));
    transport.on("stop", () => this.updateState({ isPlaying: false }));
    transport.on("pause", () => this.updateState({ isPlaying: false }));
    transport.on("loop", () => {
      this.updateState({ position: this.getPositionInBars() });
    });
  }

  private getPositionInBars(): number {
    return Tone.getTransport().position as unknown as number;
  }

  private validateTime(time: Time): Time {
    // Ensure time is valid and convert to Tone.Time if needed
    return Tone.Time(time).toBarsBeatsSixteenths();
  }

  private calculateTapTempo(): number | null {
    if (this.tapTimes.length < 2) return null;

    const intervals = this.tapTimes
      .slice(1)
      .map((time, i) => time - this.tapTimes[i]);

    const averageInterval =
      intervals.reduce((a, b) => a + b) / intervals.length;
    const bpm = Math.round(60000 / averageInterval);

    return bpm >= 20 && bpm <= 300 ? bpm : null;
  }

  private resetTapTimesAfterDelay() {
    if (this.tapResetTimeout) {
      clearTimeout(this.tapResetTimeout);
    }

    this.tapResetTimeout = setTimeout(() => {
      this.tapTimes = [];
      this.tapResetTimeout = null;
    }, this.TAP_TIMEOUT);
  }

  public registerModeHandler(
    mode: PlaybackMode,
    handler: () => void,
    cleanup: () => void,
  ): void {
    this.modeHandlers.set(mode, handler);
    this.cleanupHandlers.set(mode, cleanup);
  }

  public getState(): TransportState {
    return { ...this.state };
  }

  readonly actions: TransportActions = {
    play: async (startTime?: Time) => {
      try {
        // Ensure audio context is running
        if (Tone.getContext().state !== "running") {
          await Tone.start();
        }

        const handler = this.modeHandlers.get(this.state.mode);
        if (handler) {
          handler();
        }

        if (startTime !== undefined) {
          this.actions.seekTo(startTime);
        }

        Tone.getTransport().start();
      } catch (error) {
        console.error("Error starting playback:", error);
        this.actions.stop();
        throw error;
      }
    },

    stop: () => {
      const cleanup = this.cleanupHandlers.get(this.state.mode);
      if (cleanup) {
        cleanup();
      }
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      this.updateState({ position: 0 });
    },

    pause: () => {
      Tone.getTransport().pause();
    },

    seekTo: (position: Time) => {
      const validatedPosition = this.validateTime(position);
      Tone.getTransport().position = validatedPosition;
      this.updateState({ position: this.getPositionInBars() });
    },

    setBpm: (bpm: number) => {
      if (bpm < 20 || bpm > 300) {
        throw new Error("BPM must be between 20 and 300");
      }
      Tone.getTransport().bpm.value = bpm;
      this.updateState({ bpm });
    },

    setTimeSignature: (numerator: number, denominator: number) => {
      if (numerator < 1 || denominator < 1) {
        throw new Error("Invalid time signature values");
      }
      Tone.getTransport().timeSignature = [numerator, denominator];
      this.updateState({ timeSignature: [numerator, denominator] });
    },

    setSwing: (amount: number, subdivision?: Subdivision) => {
      if (amount < 0 || amount > 1) {
        throw new Error("Swing amount must be between 0 and 1");
      }
      Tone.getTransport().swing = amount;
      if (subdivision) {
        Tone.getTransport().swingSubdivision = subdivision;
        this.updateState({ swing: amount, swingSubdivision: subdivision });
      } else {
        this.updateState({ swing: amount });
      }
    },

    setLoop: (enabled: boolean, start?: Time, end?: Time) => {
      if (start !== undefined) {
        start = this.validateTime(start);
      }
      if (end !== undefined) {
        end = this.validateTime(end);
      }

      Tone.getTransport().loop = enabled;
      if (enabled && start !== undefined && end !== undefined) {
        Tone.getTransport().loopStart = start;
        Tone.getTransport().loopEnd = end;
        this.updateState({
          isLooping: enabled,
          loopStart: start,
          loopEnd: end,
        });
      } else {
        this.updateState({ isLooping: enabled });
      }
    },

    setMode: async (mode: PlaybackMode) => {
      const wasPlaying = this.state.isPlaying;

      // Stop current playback
      if (wasPlaying) {
        this.actions.stop();
      }

      // Clean up current mode
      const cleanup = this.cleanupHandlers.get(this.state.mode);
      if (cleanup) {
        cleanup();
      }

      // Switch mode
      this.updateState({ mode });

      // Resume playback if it was playing
      if (wasPlaying) {
        await this.actions.play();
      }
    },

    tap: () => {
      const now = Date.now();
      this.tapTimes.push(now);

      // Keep only the last MAX_TAP_SAMPLES taps
      if (this.tapTimes.length > this.MAX_TAP_SAMPLES) {
        this.tapTimes = this.tapTimes.slice(-this.MAX_TAP_SAMPLES);
      }

      const calculatedBpm = this.calculateTapTempo();
      if (calculatedBpm) {
        this.actions.setBpm(calculatedBpm);
      }

      this.resetTapTimesAfterDelay();
      return calculatedBpm;
    },

    resetTapTempo: () => {
      this.tapTimes = [];
      if (this.tapResetTimeout) {
        clearTimeout(this.tapResetTimeout);
        this.tapResetTimeout = null;
      }
    },
  };

  public dispose(): void {
    // Clean up current mode
    const cleanup = this.cleanupHandlers.get(this.state.mode);
    if (cleanup) {
      cleanup();
    }

    // Clear handlers
    this.modeHandlers.clear();
    this.cleanupHandlers.clear();
    this.onStateChange = undefined;

    // Reset transport
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
  }
}
