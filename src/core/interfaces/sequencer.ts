// src/core/interfaces/sequencer.ts

import { SequenceStatus } from "../enums";

export enum PlaybackMode {
  PATTERN = "pattern",
  PLAYLIST = "playlist",
}

export interface PlaybackState {
  mode: PlaybackMode;
  status: SequenceStatus;
  currentTime: number;
  currentBar: number;
  currentBeat: number;
  currentStep: number;
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
}

export interface TransportState {
  bpm: number;
  swing: number;
  swingSubdivision: string;
  timeSignature: [number, number];
}

export interface SequencerState {
  playback: PlaybackState;
  transport: TransportState;
  currentPatternId: string | null;

  // Transport Controls
  setPlaybackMode: (mode: PlaybackMode) => void;
  setStatus: (status: SequenceStatus) => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setTimeSignature: (numerator: number, denominator: number) => void;

  // Pattern Management
  setCurrentPattern: (patternId: string | null) => void;

  // Loop Controls
  setLoopPoints: (start: number, end: number) => void;
  setLoopEnabled: (enabled: boolean) => void;

  // Position Control
  seekToPosition: (time: number) => void;
  seekToBar: (bar: number) => void;

  // Timing Info
  getCurrentTime: () => number;
  getCurrentBar: () => number;
  getPositionInfo: () => { bar: number; beat: number; step: number };
}
