// src/core/interfaces/playlist.ts
// Arangement and track definitions

import { Time } from "tone/build/esm/core/type/Units";
import { Pattern } from "./pattern";

export interface PlaylistTrackState {
  id: string;
  name: string;
  pla: string[]; // pattern ids
  muted: boolean;
  soloed: boolean;
}

export interface PlaylistState {
  playlistTracks: PlaylistTrackState[];
  length: Time;
}

export interface PlaylistActions {
  // Track Management
  createTrack: (name: string) => string;
  deleteTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<PlaylistTrackState>) => void;
  reorderTracks: (trackIds: string[]) => void;

  // Pattern Management
  addPatternToPlaylist: (patternId: string) => string;
  removePatternFromPlaylist: (patternId: string) => void;
  movePatternFromPlaylist: (
    placementId: string,
    trackId: string,
    startTime: Time,
  ) => void;
  duplicatePatternFromPlaylist: (placementId: string) => string;

  // Playback Control
  setTrackMute: (trackId: string, muted: boolean) => void;
  setTrackSolo: (trackId: string, soloed: boolean) => void;

  // Query Methods
  getPatternAt: (time: Time) => Pattern[];
  getPatternsBetween: (startTime: Time, endTime: Time) => string[];
  getLength: () => Time;

  // Cleanup
  dispose: () => void;
}
