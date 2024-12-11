// src/core/interfaces/pattern.ts
// Pattern and track definitions

import { NormalRange, Time } from "tone/build/esm/core/type/Units";
import { Note } from "../types/common";
import * as Tone from "tone";
import { InstrumentName, InstrumentOptions, InstrumentType } from "../types";

export interface BaseSequenceEvent {
  time: Time;
  duration?: Time;
}

export interface NoteSequenceEvent extends BaseSequenceEvent {
  type: "note";
  note: Note;
  velocity?: NormalRange;
}

export interface AudioSequenceEvent extends BaseSequenceEvent {
  type: "audio";
  bufferIndex: number;
  offset?: Time;
  playbackRate?: number;
}

export type SequenceEvent = NoteSequenceEvent | AudioSequenceEvent;

export interface PatternTrackState {
  id: string;
  name: string;
  type: "instrument" | "audio";
  instrumentType?: InstrumentName;
  instrumentOptions?: InstrumentOptions;
  mixerChannelId: string;
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;
  events: SequenceEvent[];
  parameters: Record<string, number>; // Parameter values
}

// Runtime state
export interface PatternTrack {
  id: string;
  state: PatternTrackState;
  name: string;
  type: "instrument" | "audio";
  mixerChannelId: string;
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;
  events: SequenceEvent[];

  // Runtime objects
  instrument?: InstrumentType;
  player?: Tone.Player;
  channel: Tone.Channel;
  parameters: Record<string, Tone.Signal<any>>;
}

export interface PatternData {
  id: string;
  name: string;
  tracks: PatternTrackState[];
  length: Time;
  timeSignature: [number, number];
  color?: string;
  defaultLoopLength?: Time;
  isLoop?: boolean;
  loopStart?: Time;
  loopEnd?: Time;
}

export interface PatternState {
  patterns: PatternData[];
  currentPatternId: string | null;
}

export interface Pattern {
  id: string;
  tracks: PatternTrack[]; // Runtime tracks with Tone.js objects
  part?: Tone.Part<SequenceEvent>;

  // Reference to state for serialization
  state: PatternData;
}

export interface PatternActions {
  // Pattern Management
  createPattern: (name: string, timeSignature: [number, number]) => string;
  deletePattern: (id: string) => void;
  duplicatePattern: (id: string) => string;
  updatePattern: (id: string, updates: Partial<Pattern>) => void;
  setCurrentPattern: (id: string | null) => void;

  // Track Management
  addTrack: (
    patternId: string,
    name: string,
    type: "instrument" | "audio",
    instrumentType?: InstrumentName,
    options?: InstrumentOptions,
  ) => string;
  removeTrack: (patternId: string, trackId: string) => void;
  updateTrack: (
    patternId: string,
    trackId: string,
    updates: Partial<PatternTrackState>,
  ) => void;

  // Event Management
  addEvent: (patternId: string, trackId: string, event: SequenceEvent) => void;
  removeEvent: (patternId: string, trackId: string, eventId: string) => void;
  updateEvent: (
    patternId: string,
    trackId: string,
    eventId: string,
    updates: Partial<SequenceEvent>,
  ) => void;

  // Session view support
  setLoop: (id: string, isLoop: boolean, start?: Time, end?: Time) => void;
  setColor: (id: string, color: string) => void;
  setDefaultLoopLength: (id: string, length: Time) => void;

  // Utility
  getPattern: (id: string) => Pattern | undefined;
  getCurrentPattern: () => Pattern | null;
  getPatterns: () => Pattern[];
  dispose: () => void;
}
