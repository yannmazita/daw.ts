// src/features/clips/types.ts
import { EngineState } from "@/core/stores/useEngineStore";
import { Midi } from "@tonejs/midi";
import { Player, ToneAudioBuffer, Sampler } from "tone";

export interface CompositionClip {
  id: string;
  parentId: string; // id of parent track
  name: string;
  type: "midi" | "audio";
  data: Midi | ToneAudioBuffer | null;
  startTime: number;
  pausedAt: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;
  playerStartTime?: number;
  instrumentId?: string;

  node: Sampler | Player | null;
}

export interface PersistableCompositionClip {
  id: string;
  parentId: string;
  name: string;
  type: "midi" | "audio";
  startTime: number;
  pausedAt: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;
  playerStartTime?: number;
  instrumentId?: string;
}

export interface ClipState {
  clips: Record<string, CompositionClip>;
}

export interface PersistableClipState {
  clips: Record<string, PersistableCompositionClip>;
}

export interface ClipEngine {
  // Clip management
  importMidi(
    state: ClipState,
    file: File,
    clipId?: string,
    trackId?: string,
    instrumentId?: string,
  ): Promise<ClipState>;
  exportMidi(state: ClipState, clipId: string): Midi;

  // Clip operations
  createClip(
    state: ClipState,
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
    instrumentId?: string,
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
  playClip(state: EngineState, clipId: string, startTime?: number): EngineState;
  pauseClip(state: ClipState, clipId: string): ClipState;
  stopClip(state: ClipState, clipId: string): ClipState;

  // Playback state
  getClipPlaybackPosition(state: ClipState, clipId: string): number;

  // Cleanup
  dispose(state: ClipState): void;
}
