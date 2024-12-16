// src/features/transport/types.ts
import {
  BPM,
  Subdivision,
  Time,
  TimeSignature,
} from "tone/build/esm/core/type/Units";

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: Time;

  tempo: BPM;
  timeSignature: TimeSignature;

  loop: {
    enabled: boolean;
    start: Time;
    end: Time;
  };

  swing: number;
  swingSubdivision: Subdivision;
}

export interface TransportEngine {
  // Core transport
  play(time?: Time): Promise<void>;
  pause(): void;
  stop(): void;
  seekTo(time: Time): void;

  // Settings
  setTempo(tempo: BPM): void;
  setTimeSignature(numerator: number, denominator: number): void;
  setSwing(amount: number, subdivision?: Time): void;

  // Tap
  startTapTempo(): BPM;
  endTapTempo(): void;

  // Loop
  setLoop(enabled: boolean): void;
  setLoopPoints(start: Time, end: Time): void;

  // State
  getState(): TransportState;
  dispose(): void;
}
