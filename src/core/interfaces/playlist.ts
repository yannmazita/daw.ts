// src/core/interfaces/playlist.ts
// Arangement and track definitions

import { Time } from "tone/build/esm/core/type/Units";
import { Pattern } from "./pattern";

export interface PatternPlacement {
  id: string;
  patternId: string;
  startTime: Time;
  duration: Time;
  offset: Time;
}

export interface PlaylistTrackState {
  id: string;
  name: string;
  patterns: PatternPlacement[];
  muted: boolean;
  soloed: boolean;
}

export interface PlaylistState {
  tracks: PlaylistTrackState[];
  length: Time;
}

export interface PlaylistActions {
  // Track Management
  createTrack: (name: string) => string;
  deleteTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<PlaylistTrackState>) => void;
  reorderTracks: (trackIds: string[]) => void;

  // Pattern Management
  addPattern: (trackId: string, pattern: Pattern, startTime: Time) => string;
  removePattern: (trackId: string, placementId: string) => void;
  movePattern: (placementId: string, trackId: string, startTime: Time) => void;
  duplicatePattern: (placementId: string) => string;

  // Playback Control
  setTrackMute: (trackId: string, muted: boolean) => void;
  setTrackSolo: (trackId: string, soloed: boolean) => void;

  // Query Methods
  getPatternAt: (time: Time) => Pattern[];
  getPatternsBetween: (startTime: Time, endTime: Time) => PatternPlacement[];
  getLength: () => Time;

  // Cleanup
  dispose: () => void;
}
