// src/features/clips/types.ts
import { Part, Player, ToneAudioBuffer } from "tone";
import {
  Decibels,
  NormalRange,
  Note,
  Time,
} from "tone/build/esm/core/type/Units";

export interface MidiNote {
  note: Note;
  velocity: NormalRange;
  duration: Time;
  time: Time;
}

export interface ClipContent {
  id: string;
  type: "midi" | "audio";
  name: string;

  // MIDI
  notes?: MidiNote[];

  // Audio
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
  notes?: MidiNote[];

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
  trackId: string;

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
      part: Part | Player;
      clip: ArrangementClip;
    }
  >;
  isRecording: boolean;
  recordingTake?: {
    trackId: string;
    startTime: Time;
    type: "midi" | "audio";
  };
}

export interface PersistableClipState {
  contents: Record<string, ClipContent>;
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
}

export interface ClipEngine {
  // Content management
  createMidiClip(notes: MidiNote[]): string;
  createAudioClip(buffer: ToneAudioBuffer): string;
  getClipContent(contentId: string): ClipContent | undefined;

  // Clip instance management
  scheduleClip(clip: ArrangementClip): void;
  unscheduleClip(clipId: string): void;

  // Clip properties
  setClipLoop(clipId: string, enabled: boolean, settings?: ClipLoop): void;
  setClipGain(clipId: string, gain: Decibels): void;
  setClipFades(clipId: string, fadeIn: Time, fadeOut: Time): void;

  // Playback state
  isClipPlaying(clipId: string): boolean;
  getPlaybackPosition(clipId: string): Time;

  // State
  getState(): ClipState;
  dispose(): void;
}
