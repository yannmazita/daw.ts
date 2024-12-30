// src/features/transport/types.ts
import { BPM, Subdivision, Time } from "tone/build/esm/core/type/Units";

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;

  tempo: BPM;
  timeSignature: number[];
  tapTimes: number[];

  loop: {
    enabled: boolean;
    start: Time;
    end: Time;
  };

  swing: number;
  swingSubdivision: Subdivision;

  duration: Time;
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

  // Duration
  setDuration(duration: Time): void;

  // State
  getState(): TransportState;
  dispose(): void;
}
