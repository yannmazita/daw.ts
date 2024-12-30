// src/features/clips/types.ts
import { Part, Player, ToneAudioBuffer } from "tone";
import { Decibels, Time } from "tone/build/esm/core/type/Units";

export interface MidiNote {
  midi: number; // MIDI note number
  name: string; // Note name (e.g., "C4")
  pitch: string; // Pitch class (e.g., "C")
  octave: number; // Octave number
  velocity: number; // Normalized 0-1
  duration: number; // Duration in seconds
  time: number; // Time in seconds
  ticks?: number; // Optional MIDI ticks
}

export interface MidiControlChange {
  number: number; // CC number
  value: number; // Normalized 0-1
  time: number; // Time in seconds
  ticks?: number; // Optional MIDI ticks
}

export interface MidiTrackInstrument {
  number: number; // Program number
  family: string; // Instrument family
  name: string; // Instrument name
  percussion: boolean; // Is percussion channel
}

export interface MidiTrackData {
  name?: string;
  notes: MidiNote[];
  controlChanges: Record<number, MidiControlChange[]>;
  instrument: MidiTrackInstrument;
  channel: number;
}

export interface MidiClipContent {
  name: string;
  tracks: MidiTrackData[];
  duration: number;
  tempos?: {
    bpm: number;
    time: number;
  }[];
  timeSignatures?: {
    timeSignature: [number, number];
    time: number;
  }[];
}

export interface ClipContent {
  id: string;
  type: "midi" | "audio";
  name: string;

  // MIDI specific
  midiData?: MidiClipContent;

  // Audio specific
  buffer?: ToneAudioBuffer;
  warpMarkers?: {
    time: Time;
    position: Time;
  }[];
}

export interface PersistableClipContent {
  id: string;
  type: "midi" | "audio";
  name: string;

  // MIDI
  midiData?: MidiClipContent;

  // Audio
  warpMarkers?: {
    time: Time;
    position: Time;
  }[];
}

export interface ClipLoop {
  enabled: boolean;
  start: Time;
  duration: Time;
}

export interface ArrangementClip {
  id: string;
  contentId: string;

  startTime: Time;
  duration: Time;

  loop?: ClipLoop;

  gain: Decibels;
  fadeIn: Time;
  fadeOut: Time;
}

export interface ClipState {
  contents: Record<string, ClipContent>;
  activeClips: Record<
    string,
    {
      part: Part | Player | null;
      clip: ArrangementClip;
    }
  >;
  isRecording: boolean;
  recordingTake?: {
    trackId: string;
    startTime: Time;
    type: "midi" | "audio";
  };
  independentPlayback: Record<string, boolean>; // Track independent playback state per contentId
}

export interface PersistableClipState {
  contents: Record<string, PersistableClipContent>;
  activeClips: Record<
    string,
    {
      clip: ArrangementClip;
    }
  >;
  isRecording: boolean;
  recordingTake?: {
    trackId: string;
    startTime: Time;
    type: "midi" | "audio";
  };
  independentPlayback: Record<string, boolean>;
}

export interface ClipEngine {
  // MIDI import/export
  parseMidiFile(midiData: ArrayBuffer): string;
  exportMidiFile(contentId: string): Uint8Array;

  // Content management
  createMidiClip(midiData: MidiClipContent): string;
  createAudioClip(buffer: ToneAudioBuffer): string;
  getClipContent(contentId: string): ClipContent;

  // Clip instance management
  scheduleClip(clip: ArrangementClip): void;
  unscheduleClip(clipId: string): void;

  // Clip operations
  addClip(contentId: string, startTime: Time): string;
  removeClip(clipId: string): void;
  moveClip(clipId: string, newTime: Time): void;

  // Clip properties
  setClipLoop(clipId: string, enabled: boolean, settings?: ClipLoop): void;
  setClipGain(clipId: string, gain: Decibels): void;
  setClipFades(clipId: string, fadeIn: Time, fadeOut: Time): void;

  // Independant playback
  playClip(clipId: string, startTime?: Time): void;
  stopClip(clipId: string): void;

  // Playback state
  isClipPlaying(clipId: string): boolean;
  getPlaybackPosition(clipId: string): Time;

  // State
  getState(): ClipState;
  dispose(): void;
}
