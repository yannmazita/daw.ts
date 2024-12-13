// src/core/interfaces/pattern/events.ts
import { Time, NormalRange } from "tone/build/esm/core/type/Units";
import { Note } from "../../types/common";
import { TimelineObject } from "../base";

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
