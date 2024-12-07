// src/core/interfaces/pattern.ts
// Pattern and track definitions

import { NormalRange, Time } from "tone/build/esm/core/type/Units";
import { Note } from "../types/common";
import * as Tone from "tone";
import { InstrumentType } from "../types";

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

export interface Track {
  id: string;
  name: string;
  type: "instrument" | "audio";
  events: SequenceEvent[];
  muted: boolean;
  soloed: boolean;
  volume: number;
  pan: number;

  instrument?: InstrumentType;
  player?: Tone.Player;
  channel: Tone.Channel;

  // Automation data using Tone.js Signals
  parameters: Record<string, Tone.Signal<any>>;
}

export interface Pattern {
  id: string;
  name: string;
  tracks: Track[];
  length: Time;
  timeSignature: [number, number];

  // Tone.js Part for playback
  part?: Tone.Part<SequenceEvent>;
}
