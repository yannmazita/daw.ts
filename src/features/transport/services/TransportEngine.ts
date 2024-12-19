// src/features/transport/services/TransportEngine.ts
import * as Tone from "tone";
import {
  BPM,
  Subdivision,
  Time,
  TimeSignature,
} from "tone/build/esm/core/type/Units";
import { TransportEngine } from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class TransportEngineImpl implements TransportEngine {
  private disposed = false;
  private transport: typeof Tone.Transport;
  private static readonly MAX_TAP_HISTORY = 4;
  private static readonly MIN_TAP_INTERVAL = 200; // ms
  private static readonly MAX_TAP_INTERVAL = 3000; // ms
  private static readonly TAP_TIMEOUT = 3000; // ms
  private tapTempoState: {
    times: number[];
    timeoutId?: number;
    lastTapTime?: number;
  } = {
    times: [],
  };

  constructor() {
    this.transport = Tone.getTransport();
    this.initializeTransport();
  }

  private initializeTransport(): void {
    try {
      // Get initial state once to avoid multiple calls
      const state = useEngineStore.getState().transport;

      // Configure transport settings
      this.updateTransportSettings({
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
      console.error("Transport initialization failed:", error);
      throw error;
    }
  }

  private updateTransportSettings(settings: {
    bpm?: BPM;
    timeSignature?: TimeSignature;
    swing?: number;
    swingSubdivision?: Subdivision;
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
    } catch (error) {
      console.error("Failed to update transport settings:", error);
      throw error;
    }
  }

  async play(time?: Time): Promise<void> {
    this.checkDisposed();

    try {
      await Tone.start();
      this.transport.start(time);

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          isPlaying: true,
        },
      }));
    } catch (error) {
      console.error("Failed to start transport:", error);
      // Ensure state reflects failure
      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          isPlaying: false,
        },
      }));
      throw error;
    }
  }

  pause(): void {
    this.checkDisposed();

    try {
      this.transport.pause();

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          isPlaying: false,
        },
      }));
    } catch (error) {
      console.error("Failed to pause transport:", error);
      throw error;
    }
  }

  stop(): void {
    this.checkDisposed();

    try {
      this.transport.stop();

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          isPlaying: false,
          isRecording: false,
        },
      }));
    } catch (error) {
      console.error("Failed to stop transport:", error);
      throw error;
    }
  }

  seekTo(time: Time): void {
    this.checkDisposed();

    if (typeof time === "number" && (time < 0 || !isFinite(time))) {
      throw new Error("Invalid seek time");
    }

    try {
      const seconds = Tone.Time(time).toSeconds();
      this.transport.seconds = seconds;
    } catch (error) {
      console.error("Failed to seek:", error);
      throw error;
    }
  }

  getTransportDuration(): Time {
    return Tone.getTransport().seconds;
  }

  setTempo(tempo: BPM): void {
    this.checkDisposed();

    if (tempo < 20 || tempo > 999) {
      throw new Error("BPM must be between 20 and 999");
    }

    try {
      this.updateTransportSettings({ bpm: tempo });

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          tempo,
        },
      }));
    } catch (error) {
      console.error("Failed to set tempo:", error);
      throw error;
    }
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.checkDisposed();

    if (numerator < 1 || denominator < 1) {
      throw new Error("Invalid time signature values");
    }

    try {
      const timeSignature: TimeSignature = [numerator, denominator];
      this.updateTransportSettings({ timeSignature });

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          timeSignature,
        },
      }));
    } catch (error) {
      console.error("Failed to set time signature:", error);
      throw error;
    }
  }

  setSwing(amount: number, subdivision?: Subdivision): void {
    this.checkDisposed();

    // Input validation
    if (typeof amount !== "number" || !isFinite(amount)) {
      throw new Error("Swing amount must be a finite number");
    }

    if (amount < 0 || amount > 1) {
      throw new Error("Swing amount must be between 0 and 1");
    }

    try {
      // Update audio engine first
      this.updateTransportSettings({
        swing: amount,
        ...(subdivision && { swingSubdivision: subdivision }),
      });

      // If audio update succeeds, update state atomically
      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          swing: amount,
          ...(subdivision && { swingSubdivision: subdivision }),
        },
      }));
    } catch (error) {
      console.error("Failed to set swing:", error);
      // Attempt to restore previous swing settings
      try {
        const currentState = useEngineStore.getState().transport;
        this.updateTransportSettings({
          swing: currentState.swing,
          swingSubdivision: currentState.swingSubdivision,
        });
      } catch (restoreError) {
        console.error("Failed to restore swing settings:", restoreError);
      }
      throw error;
    }
  }

  startTapTempo(): BPM {
    const now = performance.now();

    // Clear existing timeout
    if (this.tapTempoState.timeoutId) {
      window.clearTimeout(this.tapTempoState.timeoutId);
    }

    // Set new timeout to clear tap history
    this.tapTempoState.timeoutId = window.setTimeout(() => {
      this.endTapTempo();
    }, TransportEngineImpl.TAP_TIMEOUT);

    // Validate interval from last tap
    if (this.tapTempoState.lastTapTime) {
      const interval = now - this.tapTempoState.lastTapTime;

      // Ignore taps that are too fast or too slow
      if (
        interval < TransportEngineImpl.MIN_TAP_INTERVAL ||
        interval > TransportEngineImpl.MAX_TAP_INTERVAL
      ) {
        this.endTapTempo();
        this.tapTempoState.times = [now];
        this.tapTempoState.lastTapTime = now;
        return useEngineStore.getState().transport.tempo;
      }
    }

    // Update tap history
    this.tapTempoState.times.push(now);
    this.tapTempoState.lastTapTime = now;

    // Keep only recent taps
    if (this.tapTempoState.times.length > TransportEngineImpl.MAX_TAP_HISTORY) {
      this.tapTempoState.times.shift();
    }

    // Calculate BPM if we have enough taps
    if (this.tapTempoState.times.length >= 2) {
      try {
        const bpm = this.calculateTapTempo();
        if (bpm) {
          this.setTempo(bpm);
          return bpm;
        }
      } catch (error) {
        console.warn("Tap tempo calculation failed:", error);
        this.endTapTempo();
      }
    }

    return useEngineStore.getState().transport.tempo;
  }

  private calculateTapTempo(): BPM | null {
    const intervals = [];
    const times = [...this.tapTempoState.times]; // Create copy for safety

    // Calculate intervals between consecutive taps
    for (let i = 1; i < times.length; i++) {
      const interval = times[i] - times[i - 1];
      intervals.push(interval);
    }

    // Calculate median interval for better stability
    const sortedIntervals = [...intervals].sort((a, b) => a - b);
    const medianInterval =
      sortedIntervals[Math.floor(sortedIntervals.length / 2)];

    // Convert to BPM
    const bpm = Math.round(60000 / medianInterval);

    // Validate BPM range
    if (bpm >= 20 && bpm <= 999) {
      return bpm;
    }

    return null;
  }

  endTapTempo(): void {
    // Clear timeout if exists
    if (this.tapTempoState.timeoutId) {
      window.clearTimeout(this.tapTempoState.timeoutId);
    }

    // Reset tap tempo state
    this.tapTempoState = {
      times: [],
    };
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
      console.error("Failed to update loop settings:", error);
      throw error;
    }
  }

  setLoop(enabled: boolean): void {
    this.checkDisposed();

    try {
      this.updateLoopSettings({ enabled });

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          loop: {
            ...state.transport.loop,
            enabled,
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set loop:", error);
      throw error;
    }
  }

  setLoopPoints(start: Time, end: Time): void {
    this.checkDisposed();

    const startSeconds = Tone.Time(start).toSeconds();
    const endSeconds = Tone.Time(end).toSeconds();

    if (startSeconds >= endSeconds) {
      throw new Error("Loop end must be after loop start");
    }

    try {
      this.updateLoopSettings({ start, end });

      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          loop: {
            ...state.transport.loop,
            start,
            end,
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set loop points:", error);
      throw error;
    }
  }

  getState() {
    return useEngineStore.getState().transport;
  }

  dispose(): void {
    this.checkDisposed();

    try {
      this.disposed = true;
      this.endTapTempo();
    } catch (error) {
      console.error("Failed to dispose transport engine:", error);
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("TransportEngine is disposed");
    }
  }
}
