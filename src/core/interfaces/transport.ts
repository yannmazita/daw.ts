// src/core/interfaces/transport.ts
// Playback and timing control interfaces

import { PlaybackMode } from "../types/common";
import { Subdivision, Time } from "tone/build/esm/core/type/Units";

export interface TransportState {
  bpm: number;
  timeSignature: [number, number];
  swing: number;
  swingSubdivision: Subdivision;
  position: number; // In bars
  isPlaying: boolean;
  isLooping: boolean;
  loopStart: Time;
  loopEnd: Time;
  mode: PlaybackMode;
}

export interface TransportActions {
  play: (startTime?: Time) => Promise<void>;
  stop: () => void;
  pause: () => void;
  seekTo: (position: Time) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (numerator: number, denominator: number) => void;
  setSwing: (amount: number) => void;
  setLoop: (enabled: boolean, start?: Time, end?: Time) => void;
  setMode: (mode: PlaybackMode) => Promise<void>;
}
