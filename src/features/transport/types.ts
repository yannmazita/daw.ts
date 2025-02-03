// src/features/transport/types.ts

export interface TransportClockConfig {
  tapTimeout: number;
  maxTapHistory: number;
  minTapInterval: number;
  maxTapInterval: number;
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;

  tempo: number;
  timeSignature: number[];
  tapTimes: number[];

  loop: {
    enabled: boolean;
    start: number;
    end: number;
  };

  duration: number;
  position: number;
}

export interface TransportEngine {
  // Core transport
  play(state: TransportState, time?: number): Promise<TransportState>;
  pause(state: TransportState): TransportState;
  stop(state: TransportState): TransportState;
  seekTo(state: TransportState, time: number): TransportState;

  // Settings
  setTempo(state: TransportState, tempo: number): TransportState;
  getTempo(): number;
  setTimeSignature(
    state: TransportState,
    numerator: number,
    denominator: number,
  ): TransportState;

  // Tap
  startTapTempo(state: TransportState): TransportState;
  endTapTempo(state: TransportState): TransportState;

  // Loop
  setLoop(state: TransportState, enabled: boolean): TransportState;
  setLoopPoints(
    state: TransportState,
    start: number,
    end: number,
  ): TransportState;

  // Duration-Position
  getTransportDuration(): number;
  setTransportDuration(state: TransportState, duration: number): TransportState;
  getTransportPosition(): number;

  // Cleanup
  dispose(state: TransportState): Promise<void>;
}
