// src/features/transport/services/TransportEngine.ts
import {
  TransportEngine,
  TransportState,
  TransportClockConfig,
} from "../types";
import { TransportClock } from "./TransportClock";

/**
 * Provides core transport functionality
 */
export class TransportEngineImpl implements TransportEngine {
  private disposed = false;
  private audioContext: AudioContext;
  private clock: TransportClock;
  private _position = 0;
  private _tempo: number;
  private _timeSignature: number[];
  private tapTimeoutId: number | null = null;
  private _loop: { enabled: boolean; start: number; end: number };
  private _duration = 0;
  private config: TransportClockConfig;

  /**
   * TransportEngineImpl constructor.
   * @param state - The initial transport state.
   * @param config - Transport clock config.
   */
  constructor(
    state: TransportState,
    config: Partial<TransportClockConfig> = {},
  ) {
    this.audioContext = new AudioContext();
    this._tempo = state.tempo;
    this._timeSignature = state.timeSignature;
    this._loop = {
      enabled: state.loop.enabled,
      start: state.loop.start,
      end: state.loop.end,
    };
    this.config = {
      tapTimeout: config.tapTimeout ?? 3000,
      maxTapHistory: config.maxTapHistory ?? 4,
      minTapInterval: config.minTapInterval ?? 200,
      maxTapInterval: config.maxTapInterval ?? 3000,
    };
    this.clock = new TransportClock(
      this.audioContext,
      this._tempo,
      this._timeSignature,
      this.tick,
    );
    this.initializeTransport(state);
  }

  /**
   * Initializes the transport engine with the provided state.
   * @param state - The initial transport state.
   */
  private initializeTransport(state: TransportState): void {
    try {
      // Configure transport settings
      this._tempo = state.tempo;
      this._timeSignature = state.timeSignature;

      // Configure loop settings
      this._loop = {
        enabled: state.loop.enabled,
        start: state.loop.start,
        end: state.loop.end,
      };
    } catch (error) {
      console.error("Transport initialization failed");
      throw error;
    }
  }

  /**
   * Calculates the current position and schedules the next tick.
   */
  private tick = () => {
    this._position = this.clock.getPosition();
    if (this._loop.enabled) {
      if (this._position >= this._loop.end) {
        this._position =
          this._loop.start + (this.clock.getPosition() - this._loop.end);
        this.clock.seek(this._position);
      }
    }
  };

  /**
   * Starts transport playback.
   * @param state - The current transport state.
   * @param time - The optional start time in seconds.
   * @returns A promise that resolves with the updated transport state.
   */
  async play(state: TransportState, time?: number): Promise<TransportState> {
    this.checkDisposed();

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.clock.start(time ?? this._position);
      return { ...state, isPlaying: true };
    } catch (error) {
      console.error("Failed to start transport", error);
      throw error;
    }
  }

  /**
   * Pauses transport playback.
   * @param state - The current transport state.
   * @returns The updated transport state.
   */
  pause(state: TransportState): TransportState {
    this.checkDisposed();

    try {
      this.clock.stop();
      return { ...state, isPlaying: false };
    } catch (error) {
      console.error("Failed to pause transport");
      throw error;
    }
  }

  /**
   * Stops transport playback and resets the position to 0.
   * @param state - The current transport state.
   * @returns The updated transport state.
   */
  stop(state: TransportState): TransportState {
    this.checkDisposed();

    try {
      this.clock.stop();
      this._position = 0;
      return { ...state, isPlaying: false, position: 0, isRecording: false };
    } catch (error) {
      console.error("Failed to stop transport");
      throw error;
    }
  }

  /**
   * Seeks transport to position.
   * @param state - The current transport state.
   * @param time - The target position in seconds.
   * @returns The updated transport state.
   */
  seekTo(state: TransportState, time: number): TransportState {
    this.checkDisposed();

    if (time < 0 || !isFinite(time)) {
      throw new Error("Invalid seek time");
    }

    try {
      this._position = time;
      this.clock.seek(this._position);
      return { ...state, position: this.clock.getCurrentPositionBeats() };
    } catch (error) {
      console.error("Failed to seek:", error);
      throw error;
    }
  }

  /**
   * Sets transport tempo.
   * @param state - The current transport state.
   * @param tempo - The new tempo in BPM.
   * @returns The updated transport state.
   */
  setTempo(state: TransportState, tempo: number): TransportState {
    this.checkDisposed();

    if (tempo < 20 || tempo > 999) {
      throw new Error("BPM must be between 20 and 999");
    }

    try {
      this._tempo = tempo;
      this.clock.setTempo(this._tempo);
      return { ...state, tempo };
    } catch (error) {
      console.error("Failed to set tempo:", error);
      throw error;
    }
  }

  /**
   * Sets transport time signature.
   * @param state - The current transport state.
   * @param numerator - Time signature numerator.
   * @param denominator - Time signature denominator.
   * @returns The updated transport state.
   */
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
      this._timeSignature = [numerator, denominator];
      return { ...state, timeSignature: [numerator, denominator] };
    } catch (error) {
      console.error("Failed to set time signature:", error);
      throw error;
    }
  }

  /**
   * Starts the tap tempo process.
   * @param state - The current transport state.
   * @returns The updated transport state.
   */
  startTapTempo(state: TransportState): TransportState {
    const now = performance.now();

    // Reset timeout
    if (this.tapTimeoutId) {
      clearTimeout(this.tapTimeoutId);
    }

    this.tapTimeoutId = window.setTimeout(() => {
      this.endTapTempo(state);
    }, this.config.tapTimeout);

    // Handle invalid intervals
    if (state.tapTimes.length > 0) {
      const interval = now - state.tapTimes[state.tapTimes.length - 1];
      if (
        interval < this.config.minTapInterval ||
        interval > this.config.maxTapInterval
      ) {
        this.endTapTempo(state);
        return { ...state, tapTimes: [now] };
      }
    }

    // Update tap times in state
    const updatedState = {
      ...state,
      tapTimes: [...state.tapTimes, now].slice(-this.config.maxTapHistory),
    };
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

  /**
   * Ends the tap tempo process.
   * @param state - The current transport state.
   * @returns The updated transport state.
   */
  endTapTempo(state: TransportState): TransportState {
    if (this.tapTimeoutId) {
      clearTimeout(this.tapTimeoutId);
      this.tapTimeoutId = null;
    }

    return { ...state, tapTimes: [] };
  }

  /**
   * Calculates the tempo based on the tap times.
   * @param times - The array of tap times.
   * @returns The calculated tempo in BPM, or null if it cannot be calculated.
   * @private
   */
  private calculateTapTempo(times: number[]): number | null {
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

  /**
   * Sets the loop enabled state.
   * @param state - The current transport state.
   * @param enabled - Whether the loop is enabled.
   * @returns The updated transport state.
   */
  setLoop(state: TransportState, enabled: boolean): TransportState {
    this.checkDisposed();

    try {
      this._loop = { ...this._loop, enabled };
      return { ...state, loop: { ...state.loop, enabled } };
    } catch (error) {
      console.error("Failed to set loop", error);
      throw error;
    }
  }

  /**
   * Sets the loop points.
   * @param state - The current transport state.
   * @param start - The loop start point in beats.
   * @param end - The loop end point in beats.
   * @returns The updated transport state.
   */
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
      this._loop = {
        ...this._loop,
        start: start,
        end: end,
      };
      return { ...state, loop: { ...state.loop, start, end } };
    } catch (error) {
      console.error("Failed to set loop points", error);
      throw error;
    }
  }

  /**
   * Gets the transport duration.
   * @returns The transport duration in beats.
   */
  getTransportDuration(): number {
    return this._duration;
  }

  /**
   * Sets the transport duration.
   * @param state - The current transport state.
   * @param duration - The new transport duration in beats.
   * @returns The updated transport state.
   */
  setTransportDuration(
    state: TransportState,
    duration: number,
  ): TransportState {
    this.checkDisposed();

    if (duration < 0) {
      throw new Error("Duration cannot be negative");
    }

    try {
      this._duration = duration;
      return { ...state, duration };
    } catch (error) {
      console.error("Failed updating duration", error);
      throw error;
    }
  }

  /**
   * Gets the current transport position.
   * @returns The current transport position in beats.
   */
  getTransportPosition(): number {
    return this.clock.getCurrentPositionBeats();
  }

  /**
   * Sets the transport position.
   * @param state - The current transport state.
   * @param position - The new transport position in seconds.
   * @returns The updated transport state.
   */
  setTransportPosition(
    state: TransportState,
    position: number,
  ): TransportState {
    this.checkDisposed();
    if (position < 0) {
      throw new Error("Position cannot be negative");
    }
    try {
      this._position = position;
      this.clock.seek(this._position);
      return { ...state, position: this.clock.getCurrentPositionBeats() };
    } catch (error) {
      console.error("Failed updating position", error);
      throw error;
    }
  }

  /**
   * Disposes of the transport engine and releases resources.
   * @param state - The current transport state.
   * @returns A promise that resolves when the transport engine is disposed.
   */
  async dispose(state: TransportState): Promise<void> {
    this.checkDisposed();

    try {
      this.disposed = true;
      this.endTapTempo(state);
      this.clock.dispose();
      await this.audioContext.close();
    } catch (error) {
      console.error("Failed to dispose transport engine", error);
      throw error;
    }
  }

  /**
   * Checks if the transport engine has been disposed of.
   * @private
   * @throws {Error} If the transport engine is disposed.
   */
  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("TransportEngine is disposed");
    }
  }

  /**
   * Gets the audio context.
   * @returns The audio context.
   */
  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}
