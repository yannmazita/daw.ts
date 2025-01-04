// src/features/composition/types.ts
import { TransportEngine } from "../transport/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";
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

  // Content
  clipIds: string[];
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
  clipIds: string[];
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

export interface CompositionState {
  tracks: Record<string, Track>;
  trackOrder: string[];
}

export interface PersistableCompositionState {
  tracks: Record<string, PersistableTrack>;
  trackOrder: string[];
}

export interface CompositionEngine {
  transportEngine: TransportEngine;
  mixEngine: MixEngine;
  clipEngine: ClipEngine;
  automationEngine: AutomationEngine;

  // Track operations
  createTrack(type: Track["type"], name?: string): string;
  updateTrack(trackId: string, updates: Partial<Track>): void;
  deleteTrack(trackId: string): void;
  moveTrack(trackId: string, newIndex: number): void;

  // Track controls
  setSolo(trackId: string, solo: boolean): void;
  setMute(trackId: string, mute: boolean): void;
  setArmed(trackId: string, armed: boolean): void;
  setPan(trackId: string, pan: number): void;
  setVolume(trackId: string, volume: number): void;
  getMeterValues(trackId: string): number | number[];

  // State
  getState(): CompositionState;
  dispose(): void;
}
