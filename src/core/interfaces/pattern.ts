// src/core/interfaces/pattern.ts

import * as Tone from "tone";
import {
  AudioNode,
  Identifiable,
  TimelineObject,
  Disposable,
} from "../interfaces/base";
import { Note } from "../types/common";
import {
  InstrumentName,
  InstrumentOptions,
  InstrumentType,
} from "../types/instrument";
import { NormalRange, Time } from "tone/build/esm/core/type/Units";

// Event system
export interface BaseEvent extends TimelineObject {
  id: string;
}

export interface NoteEvent extends BaseEvent {
  type: "note";
  note: Note;
  velocity?: NormalRange;
}

export interface AudioEvent extends BaseEvent {
  type: "audio";
  bufferIndex: number;
  offset?: Time;
  playbackRate?: number;
}

export type SequenceEvent = NoteEvent | AudioEvent;

// Track system
export interface BaseTrack extends Identifiable, AudioNode {
  mixerChannelId: string;
  events: SequenceEvent[];
  parameters: Record<string, number>;
}

export interface InstrumentTrack extends BaseTrack {
  type: "instrument";
  instrumentType: InstrumentName;
  instrumentOptions?: InstrumentOptions;
  instrument: InstrumentType;
  channel: Tone.Channel;
  signals: Record<string, Tone.Signal<any>>;
}

export interface AudioTrack extends BaseTrack {
  type: "audio";
  player: Tone.Player;
  channel: Tone.Channel;
  signals: Record<string, Tone.Signal<any>>;
}

export type PatternTrack = InstrumentTrack | AudioTrack;

// Pattern interfaces
export interface Pattern extends Identifiable, TimelineObject, Disposable {
  tracks: PatternTrack[];
  timeSignature: [number, number];
  part?: Tone.Part<SequenceEvent>;
}

// Serializable state types
export type SerializableTrack = Omit<BaseTrack, "mixerChannelId"> & {
  mixerChannelId: string;
} & (
    | {
        type: "instrument";
        instrumentType: InstrumentName;
        instrumentOptions?: InstrumentOptions;
      }
    | {
        type: "audio";
      }
  );

export interface PatternState {
  id: string;
  name: string;
  startTime: Time;
  duration: Time;
  timeSignature: [number, number];
  tracks: SerializableTrack[];
}

// Root state
export interface PatternsState {
  patterns: PatternState[];
  currentPatternId: string | null;
}

// Action interfaces
export interface TrackActions {
  createInstrumentTrack(
    patternId: string,
    name: string,
    instrumentType: InstrumentName,
    options?: InstrumentOptions,
  ): string;

  createAudioTrack(patternId: string, name: string): string;

  removePatternTrack(patternId: string, trackId: string): void;

  updatePatternTrack<T extends PatternTrack>(
    patternId: string,
    trackId: string,
    updates: Partial<T>,
  ): void;
}

export interface EventActions {
  addNoteEvent(
    patternId: string,
    trackId: string,
    event: Omit<NoteEvent, "id">,
  ): string;

  addAudioEvent(
    patternId: string,
    trackId: string,
    event: Omit<AudioEvent, "id">,
  ): string;

  removeEvent(patternId: string, trackId: string, eventId: string): void;

  updateEvent<T extends SequenceEvent>(
    patternId: string,
    trackId: string,
    eventId: string,
    updates: Partial<Omit<T, "id" | "type">>,
  ): void;
}

export interface PatternActions extends TrackActions, EventActions {
  createPattern(name: string, timeSignature: [number, number]): string;
  deletePattern(id: string): void;
  duplicatePattern(id: string): string;
  updatePattern(
    id: string,
    updates: Partial<Omit<Pattern, "tracks" | "part">>,
  ): void;
  setCurrentPattern(id: string | null): void;

  // Utility methods
  getPattern(id: string): Pattern | undefined;
  getCurrentPattern(): Pattern | null;
  getPatterns(): Pattern[];
}
