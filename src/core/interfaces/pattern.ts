// src/core/interfaces/pattern.ts
// Pattern and track definitions

import { Time } from "tone/build/esm/core/type/Units";
import { Note } from "../types/common";
import * as Tone from "tone";

export interface BaseTrackEvent {
  time: Time;
  duration?: Time;
  velocity?: number;
}

export interface NoteEvent extends BaseTrackEvent {
  note: Note;
}

export interface AudioEvent extends BaseTrackEvent {
  bufferIndex: number;
  offset?: Time;
  playbackRate?: number;
}

export type TrackEvent = NoteEvent | AudioEvent;

export interface Track {
  id: string;
  name: string;
  type: "instrument" | "audio";
  events: TrackEvent[];
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;

  // Direct references to Tone.js objects
  instrument?: Tone.Instrument;
  player?: Tone.Player;
  channel: Tone.Channel;

  // Automation data using Tone.js Signals
  parameters: {
    [key: string]: Tone.Signal<any>;
  };
}

export interface Pattern {
  id: string;
  name: string;
  tracks: Track[];
  length: Time;
  timeSignature: [number, number];

  // Tone.js Part for playback
  part?: Tone.Part<TrackEvent>;
}
