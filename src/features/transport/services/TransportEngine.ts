// src/features/transport/services/TransportEngine.ts
import * as Tone from "tone";
import {
  BPM,
  Subdivision,
  Time,
  TimeSignature,
} from "tone/build/esm/core/type/Units";
import { TransportEngine, TransportState } from "../types";
import { updateTransportState } from "../utils/stateUtils";

export class TransportEngineImpl implements TransportEngine {
  private disposed = false;
  private transport: ReturnType<typeof Tone.getTransport>;
  private static readonly MAX_TAP_HISTORY = 4;
  private static readonly MIN_TAP_INTERVAL = 200; // ms
  private static readonly MAX_TAP_INTERVAL = 3000; // ms
  private static readonly TAP_TIMEOUT = 3000; // ms
  private tapTimeoutId: number | null = null;

  constructor(state: TransportState) {
    this.transport = Tone.getTransport();
    this.initializeTransport(state);
  }

  private initializeTransport(state: TransportState): void {
    try {
      // Configure transport settings
      this.updateTransportRuntime({
        bpm: state.tempo,
        timeSignature: state.timeSignature,
        swing: state.swing,
        swingSubdivision: state.swingSubdivision,
      });

      // Configure loop settings
      if (state.loop.enabled) {
        this.updateLoopSettings({
          enabled: true,
          start: state.loop.start,
          end: state.loop.end,
        });
      }
    } catch (error) {
      console.error("Transport initialization failed");
      throw error;
    }
  }

  private updateTransportRuntime(settings: {
    bpm?: number;
    timeSignature?: number[];
    swing?: number;
    swingSubdivision?: Subdivision;
    duration?: number;
  }): void {
    try {
      if (settings.bpm !== undefined) {
        this.transport.bpm.value = settings.bpm;
      }
      if (settings.timeSignature !== undefined) {
        this.transport.timeSignature = settings.timeSignature;
      }
      if (settings.swing !== undefined) {
        this.transport.swing = settings.swing;
      }
      if (settings.swingSubdivision !== undefined) {
        this.transport.swingSubdivision = settings.swingSubdivision;
      }
      if (settings.duration !== undefined) {
        this.transport.seconds = settings.duration;
      }
    } catch (error) {
      console.error("Failed to update transport settings");
      throw error;
    }
  }

  async play(state: TransportState, time?: Time): Promise<TransportState> {
    this.checkDisposed();

    try {
      await Tone.start();
      this.transport.start(time);
      return updateTransportState(state, { isPlaying: true });
    } catch (error) {
      console.error("Failed to start transport");
      throw error;
    }
  }

  pause(state: TransportState): TransportState {
    this.checkDisposed();

    try {
      this.transport.pause();

      return updateTransportState(state, { isPlaying: false });
    } catch (error) {
      console.error("Failed to pause transport");
      throw error;
    }
  }

  stop(state: TransportState): TransportState {
    this.checkDisposed();

    try {
      this.transport.stop();

      return updateTransportState(state, {
        isPlaying: false,
        isRecording: false,
      });
    } catch (error) {
      console.error("Failed to stop transport");
      throw error;
    }
  }

  seekTo(state: TransportState, time: number): TransportState {
    this.checkDisposed();

    if (time < 0 || !isFinite(time)) {
      throw new Error("Invalid seek time");
    }

    try {
      this.transport.seconds = time;
      return updateTransportState(state, { position: time });
    } catch (error) {
      console.error("Failed to seek:");
      throw error;
    }
  }

  setTempo(state: TransportState, tempo: BPM): TransportState {
    this.checkDisposed();

    if (tempo < 20 || tempo > 999) {
      throw new Error("BPM must be between 20 and 999");
    }

    try {
      this.updateTransportRuntime({ bpm: tempo });
      return updateTransportState(state, { tempo });
    } catch (error) {
      console.error("Failed to set tempo:");
      throw error;
    }
  }

  setTimeSignature(
    state: TransportState,
    numerator: number,
    denominator: number,
  ): TransportState {
    this.checkDisposed();

    if (numerator < 1 || denominator < 1) {
      throw new Error("Invalid time signature values");
    }

    try {
      const timeSignature: TimeSignature = [numerator, denominator];
      this.updateTransportRuntime({ timeSignature });
      return updateTransportState(state, { timeSignature });
    } catch (error) {
      console.error("Failed to set time signature:");
      throw error;
    }
  }

  setSwing(
    state: TransportState,
    amount: number,
    subdivision?: Subdivision,
  ): TransportState {
    this.checkDisposed();

    if (typeof amount !== "number" || !isFinite(amount)) {
      throw new Error("Swing amount must be a finite number");
    }

    if (amount < 0 || amount > 1) {
      throw new Error("Swing amount must be between 0 and 1");
    }

    try {
      this.updateTransportRuntime({
        swing: amount,
        ...(subdivision && { swingSubdivision: subdivision }),
      });
      return updateTransportState(state, {
        swing: amount,
        ...(subdivision && { swingSubdivision: subdivision }),
      });
    } catch (error) {
      console.error("Failed to set swing");
      throw error;
    }
  }

  startTapTempo(state: TransportState): TransportState {
    const now = performance.now();

    // Reset timeout
    if (this.tapTimeoutId) {
      clearTimeout(this.tapTimeoutId);
    }

    this.tapTimeoutId = window.setTimeout(() => {
      this.endTapTempo(state);
    }, TransportEngineImpl.TAP_TIMEOUT);

    // Handle invalid intervals
    if (state.tapTimes.length > 0) {
      const interval = now - state.tapTimes[state.tapTimes.length - 1];
      if (
        interval < TransportEngineImpl.MIN_TAP_INTERVAL ||
        interval > TransportEngineImpl.MAX_TAP_INTERVAL
      ) {
        this.endTapTempo(state);
        return updateTransportState(state, { tapTimes: [now] });
      }
    }

    // Update tap times in state
    const updatedState = updateTransportState(state, {
      tapTimes: [...state.tapTimes, now].slice(
        -TransportEngineImpl.MAX_TAP_HISTORY,
      ),
    });

    // Calculate BPM if possible
    if (updatedState.tapTimes.length >= 2) {
      const bpm = this.calculateTapTempo(updatedState.tapTimes);
      if (bpm) {
        // We set the tempo here, but we don't return the new state,
        // as this method is only for tap tempo, and the state
        // should be updated by the caller.
        this.setTempo(updatedState, bpm);
      }
    }

    return updatedState;
  }

  endTapTempo(state: TransportState): TransportState {
    if (this.tapTimeoutId) {
      clearTimeout(this.tapTimeoutId);
      this.tapTimeoutId = null;
    }

    return updateTransportState(state, { tapTimes: [] });
  }

  private calculateTapTempo(times: number[]): BPM | null {
    const intervals = [];
    for (let i = 1; i < times.length; i++) {
      intervals.push(times[i] - times[i - 1]);
    }

    if (intervals.length === 0) return null;

    const medianInterval = intervals.sort((a, b) => a - b)[
      Math.floor(intervals.length / 2)
    ];
    const bpm = Math.round(60000 / medianInterval);

    return bpm >= 20 && bpm <= 999 ? bpm : null;
  }

  private updateLoopSettings(settings: {
    enabled?: boolean;
    start?: Time;
    end?: Time;
  }): void {
    try {
      if (settings.enabled !== undefined) {
        this.transport.loop = settings.enabled;
      }
      if (settings.start !== undefined) {
        this.transport.loopStart = settings.start;
      }
      if (settings.end !== undefined) {
        this.transport.loopEnd = settings.end;
      }
    } catch (error) {
      console.error("Failed to update loop settings");
      throw error;
    }
  }

  setLoop(state: TransportState, enabled: boolean): TransportState {
    this.checkDisposed();

    try {
      this.updateLoopSettings({ enabled });

      return updateTransportState(state, {
        loop: {
          ...state.loop,
          enabled,
        },
      });
    } catch (error) {
      console.error("Failed to set loop");
      throw error;
    }
  }

  setLoopPoints(
    state: TransportState,
    start: number,
    end: number,
  ): TransportState {
    this.checkDisposed();

    if (start >= end) {
      throw new Error("Loop end must be after loop start");
    }

    try {
      this.updateLoopSettings({ start, end });
      return updateTransportState(state, {
        loop: {
          ...state.loop,
          start,
          end,
        },
      });
    } catch (error) {
      console.error("Failed to set loop points");
      throw error;
    }
  }

  getTransportDuration(): number {
    return Tone.getTransport().seconds;
  }

  setTransportDuration(
    state: TransportState,
    duration: number,
  ): TransportState {
    this.checkDisposed();

    if (duration < 0) {
      throw new Error("Duration cannot be negative");
    }

    try {
      this.updateTransportRuntime({ duration });
      return updateTransportState(state, { duration });
    } catch (error) {
      console.error("Failed updating duration");
      throw error;
    }
  }

  getTransportPosition(): number {
    return Tone.Time(Tone.getTransport().position).toSeconds();
  }

  setTransportPosition(
    state: TransportState,
    position: number,
  ): TransportState {
    this.checkDisposed();
    if (position < 0) {
      throw new Error("Position cannot be negative");
    }
    try {
      this.transport.seconds = position;
      return updateTransportState(state, { position });
    } catch (error) {
      console.error("Failed updating position");
      throw error;
    }
  }

  dispose(state: TransportState): void {
    this.checkDisposed();

    try {
      this.disposed = true;
      this.endTapTempo(state);
    } catch (error) {
      console.error("Failed to dispose transport engine");
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("TransportEngine is disposed");
    }
  }
}
