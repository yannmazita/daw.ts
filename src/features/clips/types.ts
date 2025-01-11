// src/features/clips/types.ts
import { Midi } from "@tonejs/midi";
import { Part, Player, ToneAudioBuffer } from "tone";

export interface CompositionClip {
  id: string;
  parentId: string;
  name: string;
  type: "midi" | "audio";
  data: Midi | ToneAudioBuffer | null;
  startTime: number;
  pausedAt: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;

  node: Part | Player | null;
}

export interface PersistableCompositionClip {
  id: string;
  parentId: string; // id of parent track
  name: string;
  type: "midi" | "audio";
  startTime: number;
  pausedAt: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;
}

export interface ClipState {
  clips: Record<string, CompositionClip>;
}

export interface PersistableClipState {
  clips: Record<string, PersistableCompositionClip>;
}

export interface ClipEngine {
  // Clip management
  importMidi(state: ClipState, clipId: string, file: File): Promise<ClipState>;
  exportMidi(state: ClipState, clipId: string): Midi;

  // Clip operations
  createClip(
    state: ClipState,
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
  ): ClipState;
  deleteClip(state: ClipState, clipId: string): ClipState;
  moveClip(state: ClipState, clipId: string, newTime: number): ClipState;

  // Clip properties
  setClipFades(
    state: ClipState,
    clipId: string,
    fadeIn: number,
    fadeOut: number,
  ): ClipState;

  // Clip playback
  playClip(state: ClipState, clipId: string, startTime?: number): ClipState;
  pauseClip(state: ClipState, clipId: string): ClipState;
  stopClip(state: ClipState, clipId: string): ClipState;

  // Playback state
  getClipPlaybackPosition(state: ClipState, clipId: string): number;

  // Cleanup
  dispose(state: ClipState): void;
}
