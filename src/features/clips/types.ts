// src/features/clips/types.ts
import { EngineState } from "@/core/stores/useEngineStore";
import { Part, Player, ToneAudioBuffer } from "tone";

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
    time: number;
    position: number;
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
    time: number;
    position: number;
  }[];
}

export interface ClipLoop {
  enabled: boolean;
  start: number;
  duration: number;
}

export interface CompositionClip {
  id: string;
  contentId: string;

  startTime: number;
  duration: number;

  loop?: ClipLoop;

  gain: number;
  fadeIn: number;
  fadeOut: number;
}

export interface ClipState {
  contents: Record<string, ClipContent>;
  activeClips: Record<
    string,
    {
      part: Part | Player | null;
      clip: CompositionClip;
    }
  >;
  isRecording: boolean;
  recordingTake?: {
    trackId: string;
    startTime: number;
    type: "midi" | "audio";
  };
  independentPlayback: Record<string, boolean>; // Track independent playback state per contentId
}

export interface PersistableClipState {
  contents: Record<string, PersistableClipContent>;
  activeClips: Record<
    string,
    {
      clip: CompositionClip;
    }
  >;
  isRecording: boolean;
  recordingTake?: {
    trackId: string;
    startTime: number;
    type: "midi" | "audio";
  };
  independentPlayback: Record<string, boolean>;
}

export interface ClipEngine {
  // Content management
  createMidiClip(state: ClipState, midiData: MidiClipContent): ClipState;
  createAudioClip(state: ClipState, buffer: ToneAudioBuffer): ClipState;
  getClipContent(state: ClipState, contentId: string): ClipContent;

  // Clip instance management
  scheduleClip(state: EngineState, clip: CompositionClip): EngineState;
  unscheduleClip(state: EngineState, clipId: string): EngineState;

  // Clip operations
  addClip(
    state: EngineState,
    contentId: string,
    startTime: number,
  ): EngineState;
  removeClip(state: EngineState, clipId: string): EngineState;
  moveClip(state: EngineState, clipId: string, newTime: number): EngineState;

  // Clip properties
  setClipLoop(
    state: ClipState,
    clipId: string,
    enabled: boolean,
    settings?: ClipLoop,
  ): ClipState;
  setClipGain(state: ClipState, clipId: string, gain: number): ClipState;
  setClipFades(
    state: ClipState,
    clipId: string,
    fadeIn: number,
    fadeOut: number,
  ): ClipState;

  // Independant playback
  playClip(state: ClipState, clipId: string, startTime?: number): void;
  stopClip(state: ClipState, clipId: string): void;

  // Playback state
  isClipPlaying(state: ClipState, clipId: string): boolean;
  getPlaybackPosition(state: ClipState, clipId: string): number;

  // Cleanup
  dispose(state: EngineState): void;
}
