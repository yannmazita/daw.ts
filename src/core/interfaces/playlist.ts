// src/core/interfaces/playlist.ts

import { Pattern } from "./pattern";

export interface PlaylistTrack {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  height: number;
  collapsed: boolean;
}

export interface PatternInstance {
  id: string;
  patternId: string;
  trackId: string;
  startTime: number; // In bars
  duration: number; // In bars
  offset: number; // Start offset within pattern (in bars)
  muted: boolean;
}

export interface PlaylistState {
  tracks: PlaylistTrack[];
  patterns: PatternInstance[];
  length: number; // Total length in bars

  // Track Management
  addTrack: (track: Omit<PlaylistTrack, "id">) => string;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<PlaylistTrack>) => void;
  reorderTracks: (trackIds: string[]) => void;

  // Pattern Management
  addPatternInstance: (instance: Omit<PatternInstance, "id">) => string;
  removePatternInstance: (id: string) => void;
  updatePatternInstance: (
    id: string,
    updates: Partial<PatternInstance>,
  ) => void;
  movePatternInstance: (id: string, trackId: string, startTime: number) => void;

  // Pattern Queries
  getPatternInstancesInTimeRange: (
    startTime: number,
    endTime: number,
  ) => PatternInstance[];
  getPatternInstancesForTrack: (trackId: string) => PatternInstance[];

  // Playlist Operations
  clearTrack: (trackId: string) => void;
  clearAll: () => void;
  duplicatePatternInstance: (id: string) => string;

  // Utility
  hasPatterns: () => boolean;
  getLength: () => number;
  updateLength: () => void;
}
