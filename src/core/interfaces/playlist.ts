// src/core/interfaces/playlist.ts

import { Time } from "tone/build/esm/core/type/Units";
import { Pattern } from "./pattern";
import { Identifiable, AudioNode, Disposable } from "../interfaces/base";

export interface PatternPlacement {
  patternId: string;
  startTime: Time;
  duration: Time;
}

export interface PlaylistTrack extends Identifiable, AudioNode {
  patterns: PatternPlacement[];
}

export interface PlaylistState {
  tracks: PlaylistTrack[];
  length: Time;
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
    startTime: Time,
  ): string;
  removePlaylistPattern(trackId: string, patternId: string): void;
  movePattern(trackId: string, patternId: string, startTime: Time): void;

  // Playback Control
  setTrackMute(trackId: string, muted: boolean): void;
  setTrackSolo(trackId: string, soloed: boolean): void;

  // Query Methods
  getPatternAt(time: Time): Pattern[];
  getPatternsBetween(startTime: Time, endTime: Time): Pattern[];
  getLength(): Time;
}

// Root interface
export interface Playlist extends Disposable {
  state: PlaylistState;
  actions: PlaylistActions;
}
