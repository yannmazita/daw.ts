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

export interface PlaylistTrack {
  id: string;
  name: string;
  patterns: PatternPlacement[];
  muted: boolean;
  soloed: boolean;
}

export interface Playlist {
  tracks: PlaylistTrack[];
  length: Time;

  // Methods for pattern arrangement
  addPattern: (trackId: string, pattern: Pattern, startTime: Time) => string;
  removePattern: (trackId: string, placementId: string) => void;
  movePattern: (placementId: string, trackId: string, startTime: Time) => void;
  getPatternAt: (time: Time) => Pattern[];
}
