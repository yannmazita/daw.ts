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
  private tapTempoTimes: number[] = [];
  private disposed = false;

  constructor() {
    // Initialize Tone Transport with stored values
    const state = useEngineStore.getState().transport;

    Tone.getTransport().bpm.value = state.tempo;
    Tone.getTransport().timeSignature = state.timeSignature;
    Tone.getTransport().swing = state.swing;
    Tone.getTransport().swingSubdivision = state.swingSubdivision;

    // Set up loop if enabled
    if (state.loop.enabled) {
      Tone.getTransport().loop = true;
      Tone.getTransport().loopStart = state.loop.start;
      Tone.getTransport().loopEnd = state.loop.end;
    }

    // Set up time tracking
    Tone.getTransport().scheduleRepeat(() => {
      this.updateCurrentTime();
    }, "16n");
  }

  private updateCurrentTime() {
    if (!this.disposed) {
      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          currentTime: Tone.getTransport().seconds,
        },
      }));
    }
  }

  async play(time?: Time): Promise<void> {
    try {
      await Tone.start();
      Tone.getTransport().start(time);
      useEngineStore.setState((state) => ({
        transport: {
          ...state.transport,
          isPlaying: true,
        },
      }));
    } catch (error) {
      console.error("Failed to start transport:", error);
      throw error;
    }
  }

  pause(): void {
    Tone.getTransport().pause();
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        isPlaying: false,
      },
    }));
  }

  stop(): void {
    Tone.getTransport().stop();
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        isPlaying: false,
        isRecording: false,
        currentTime: 0,
      },
    }));
  }

  seekTo(time: Time): void {
    if (typeof time === "number" && (time < 0 || !isFinite(time))) {
      throw new Error("Invalid seek time");
    }
    Tone.getTransport().seconds = Tone.Time(time).toSeconds();
    this.updateCurrentTime();
  }

  setTempo(tempo: BPM): void {
    if (tempo < 20 || tempo > 999) {
      throw new Error("BPM must be between 20 and 999");
    }
    Tone.getTransport().bpm.value = tempo;
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        tempo,
      },
    }));
  }

  setTimeSignature(numerator: number, denominator: number): void {
    if (numerator < 1 || denominator < 1) {
      throw new Error("Invalid time signature values");
    }
    const timeSignature: TimeSignature = [numerator, denominator];
    Tone.getTransport().timeSignature = timeSignature;
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        timeSignature,
      },
    }));
  }

  setSwing(amount: number, subdivision?: Subdivision): void {
    if (amount < 0 || amount > 1) {
      throw new Error("Swing amount must be between 0 and 1");
    }
    Tone.getTransport().swing = amount;
    if (subdivision) {
      Tone.getTransport().swingSubdivision = subdivision;
    }
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        swing: amount,
        ...(subdivision && { swingSubdivision: subdivision }),
      },
    }));
  }

  startTapTempo(): BPM {
    const now = performance.now();
    this.tapTempoTimes.push(now);

    // Keep only the last 4 taps
    if (this.tapTempoTimes.length > 4) {
      this.tapTempoTimes.shift();
    }

    // Calculate BPM if we have at least 2 taps
    if (this.tapTempoTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < this.tapTempoTimes.length; i++) {
        intervals.push(this.tapTempoTimes[i] - this.tapTempoTimes[i - 1]);
      }

      const averageInterval =
        intervals.reduce((a, b) => a + b) / intervals.length;
      const bpm = Math.round(60000 / averageInterval);

      if (bpm >= 20 && bpm <= 999) {
        this.setTempo(bpm);
        return bpm;
      }
    }

    return useEngineStore.getState().transport.tempo;
  }

  endTapTempo(): void {
    this.tapTempoTimes = [];
  }

  setLoop(enabled: boolean): void {
    Tone.getTransport().loop = enabled;
    useEngineStore.setState((state) => ({
      transport: {
        ...state.transport,
        loop: {
          ...state.transport.loop,
          enabled,
        },
      },
    }));
  }

  setLoopPoints(start: Time, end: Time): void {
    const startSeconds = Tone.Time(start).toSeconds();
    const endSeconds = Tone.Time(end).toSeconds();

    if (startSeconds >= endSeconds) {
      throw new Error("Loop end must be after loop start");
    }

    Tone.getTransport().loopStart = start;
    Tone.getTransport().loopEnd = end;

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
  }

  getState() {
    return useEngineStore.getState().transport;
  }

  dispose(): void {
    this.disposed = true;
    this.tapTempoTimes = [];
  }
}
