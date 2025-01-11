// src/features/tracks/types.ts

import { Channel, Gain, Meter, Panner } from "tone";
export interface TrackControlState {
  solo: boolean;
  mute: boolean;
  armed: boolean;
  pan: number;
  volume: number;

  peakLevel: [number, number];
  clipWarning: boolean;
  lastClipTime: number | null;
}

export interface PersistableTrackControlState {
  solo: boolean;
  mute: boolean;
  armed: boolean;
  pan: number;
  volume: number;
}

export interface BaseTrack {
  id: string;
  name: string;
  controls: TrackControlState;

  automationIds: string[];

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  meter: Meter;
  panner: Panner;
}

export interface PersistableBaseTrack {
  id: string;
  name: string;
  controls: PersistableTrackControlState;
  automationIds: string[];
}

export interface AudioTrack extends BaseTrack {
  type: "audio";
}

export interface PersistableAudioTrack extends PersistableBaseTrack {
  type: "audio";
}

export interface MidiTrack extends BaseTrack {
  type: "midi";
}

export interface PersistableMidiTrack extends PersistableBaseTrack {
  type: "midi";
}

export type Track = AudioTrack | MidiTrack;

export type PersistableTrack = PersistableAudioTrack | PersistableMidiTrack;

export interface TrackState {
  tracks: Record<string, Track>;
  trackOrder: string[];
}

export interface PersistableTrackState {
  tracks: Record<string, PersistableTrack>;
  trackOrder: string[];
}

export interface TrackEngine {
  // Track operations
  initializeTracks(state: TrackState): TrackState;
  createTrack(
    state: TrackState,
    type: Track["type"],
    name?: string,
  ): TrackState;
  updateTrack(
    state: TrackState,
    trackId: string,
    updates: Partial<Track>,
  ): TrackState;
  deleteTrack(state: TrackState, trackId: string): TrackState;
  moveTrack(state: TrackState, trackId: string, newIndex: number): TrackState;

  // Track controls
  setSolo(state: TrackState, trackId: string, solo: boolean): TrackState;
  setMute(state: TrackState, trackId: string, mute: boolean): TrackState;
  setArmed(state: TrackState, trackId: string, armed: boolean): TrackState;
  setPan(state: TrackState, trackId: string, pan: number): TrackState;
  setVolume(state: TrackState, trackId: string, volume: number): TrackState;
  getMeterValues(state: TrackState, trackId: string): number | number[];

  // Cleanup
  dispose(state: TrackState): TrackState;
}
