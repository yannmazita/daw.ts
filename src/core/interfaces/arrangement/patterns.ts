// src/core/interfaces/arrangement/patterns.ts
import { Time } from "tone/build/esm/core/type/Units";
import { Identifiable } from "../base";

export interface TimelinePattern extends Identifiable {
  patternId: string;
  trackId: string;
  startTime: Time;
  duration: Time;
  offset: Time; // Start offset within pattern
  gain: number;
  fadeIn: Time;
  fadeOut: Time;
  isLooped: boolean;
  loopCount: number;
  muted: boolean;
  color?: string;
}

export interface TimelinePatternReference {
  id: string;
  startTime: Time;
  duration: Time;
}

export interface PatternArrangementState {
  patterns: Record<string, TimelinePattern>;
  trackPatterns: Record<string, TimelinePatternReference[]>;
  selectedPatternIds: string[];
}

export interface PatternArrangementActions {
  // Pattern Placement
  addPattern(
    trackId: string,
    patternId: string,
    startTime: Time,
    options?: Partial<TimelinePattern>,
  ): string;
  removePattern(id: string): void;
  duplicatePattern(id: string, newStartTime?: Time): string;

  // Pattern Manipulation
  movePattern(id: string, newStartTime: Time): void;
  resizePattern(id: string, newDuration: Time): void;
  setPatternOffset(id: string, offset: Time): void;
  setPatternGain(id: string, gain: number): void;
  setPatternFades(id: string, fadeIn: Time, fadeOut: Time): void;

  // Loop Operations
  setPatternLoop(id: string, isLooped: boolean, count?: number): void;

  // Pattern Splitting/Trimming
  splitPattern(id: string, splitTime: Time): [string, string];
  trimPattern(id: string, startTrim: Time, endTrim: Time): void;
  mergePatterns(patternIds: string[]): string;

  // Track Operations
  movePatternToTrack(id: string, newTrackId: string): void;
  getTrackPatterns(trackId: string): TimelinePattern[];

  // Query Operations
  getPatternsInRange(startTime: Time, endTime: Time): TimelinePattern[];
  getPatternsAtTime(time: Time): TimelinePattern[];
  getPattern(id: string): TimelinePattern | undefined;

  // Selection
  selectPatterns(ids: string[]): void;
  clearSelection(): void;

  // Validation
  validatePatternPlacement(
    trackId: string,
    startTime: Time,
    duration: Time,
    excludeId?: string,
  ): boolean;
}

export interface PatternArrangementManager {
  state: PatternArrangementState;
  actions: PatternArrangementActions;
  dispose(): void;
}
