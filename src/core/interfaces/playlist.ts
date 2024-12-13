// src/core/interfaces/playlist.ts

import { Time } from "tone/build/esm/core/type/Units";
import { Pattern } from "./pattern";
import { Identifiable, AudioNode, Disposable } from "../interfaces/base";
import { ClipState } from "../types/common";

export type ClipStateMap = Record<string, Record<number, ClipState>>;

export interface PatternPlacement {
  patternId: string;
  startTime: Time;
  duration: Time;
  slotIndex: number;
}

export interface PlaylistTrack extends Identifiable, AudioNode {
  patterns: PatternPlacement[];
}

export interface PlaylistState {
  tracks: PlaylistTrack[];
  length: Time;
  clipStates: ClipStateMap;
}

// Simplified actions
export interface PlaylistActions {
  // Track Management
  createPlaylistTrack(name: string): string;
  deletePlaylistTrack(trackId: string): void;
  updatePlaylistTrack(trackId: string, updates: Partial<PlaylistTrack>): void;
  reorderPlaylistTracks(trackIds: string[]): void;

  // Pattern Management
  addPlaylistPattern(
    trackId: string,
    patternId: string,
    startTime: string,
  ): string;
  removePlaylistPattern(trackId: string, patternId: string): void;
  movePattern(trackId: string, patternId: string, startTime: Time): void;

  // Playback Control
  setTrackMute(trackId: string, muted: boolean): void;
  setTrackSolo(trackId: string, soloed: boolean): void;

  // Clip State Management
  getClipState(trackId: string, slotIndex: number): ClipState;
  setClipState(trackId: string, slotIndex: number, state: ClipState): void;
  clearClipState(trackId: string, slotIndex: number): void;

  // Query Methods
  getPatternAt(time: Time): Pattern[];
  getPatternsBetween(startTime: Time, endTime: Time): Pattern[];
  getLength(): Time;
  getPatternAtSlot(trackId: string, slotIndex: number): Pattern | undefined;
}

// Root interface
export interface Playlist extends Disposable {
  state: PlaylistState;
  actions: PlaylistActions;
}
