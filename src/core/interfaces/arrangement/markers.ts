// src/core/interfaces/arrangement/markers.ts
import { Time } from "tone/build/esm/core/type/Units";
import { Identifiable, Disposable } from "../base";

export enum MarkerType {
  GENERIC = "generic",
  TEMPO = "tempo",
  TIME_SIGNATURE = "timeSignature",
  REHEARSAL = "rehearsal",
  SECTION = "section",
}

export interface TimelineMarker extends Identifiable {
  time: Time;
  type: MarkerType;
  color?: string;
  value: MarkerValue;
}

export type MarkerValue =
  | GenericMarkerValue
  | TempoMarkerValue
  | TimeSignatureMarkerValue;

export interface GenericMarkerValue {
  type: MarkerType.GENERIC | MarkerType.REHEARSAL | MarkerType.SECTION;
  label: string;
}

export interface TempoMarkerValue {
  type: MarkerType.TEMPO;
  bpm: number;
  curve?: "linear" | "exponential" | "target";
  targetTime?: Time; // For gradual tempo changes
}

export interface TimeSignatureMarkerValue {
  type: MarkerType.TIME_SIGNATURE;
  numerator: number;
  denominator: number;
}

export interface TimelineRegion extends Identifiable {
  startTime: Time;
  duration: Time;
  color: string;
  isLoop: boolean;
  stackOrder: number; // For overlapping regions
}

export interface MarkerManagerState {
  markers: TimelineMarker[];
  regions: TimelineRegion[];
  activeLoopRegion: string | null;
}

export interface MarkerManagerActions {
  // Marker Operations
  addMarker(
    time: Time,
    type: MarkerType,
    value: MarkerValue,
    color?: string,
  ): string;
  removeMarker(id: string): void;
  updateMarker(id: string, updates: Partial<Omit<TimelineMarker, "id">>): void;
  moveMarker(id: string, newTime: Time): void;
  getMarkersInRange(startTime: Time, endTime: Time): TimelineMarker[];

  // Region Operations
  addRegion(
    startTime: Time,
    duration: Time,
    name: string,
    color: string,
    isLoop?: boolean,
  ): string;
  removeRegion(id: string): void;
  updateRegion(id: string, updates: Partial<Omit<TimelineRegion, "id">>): void;
  moveRegion(id: string, newStartTime: Time): void;
  resizeRegion(id: string, newDuration: Time): void;
  getRegionsInRange(startTime: Time, endTime: Time): TimelineRegion[];

  // Loop Region Control
  setLoopRegion(id: string | null): void;
  getActiveLoopRegion(): TimelineRegion | null;

  // Utility
  getMarkerAtTime(time: Time, tolerance?: Time): TimelineMarker | null;
  getRegionAtTime(time: Time): TimelineRegion[];
  sortMarkers(): void;
  validateRegionBoundaries(region: Partial<TimelineRegion>): boolean;
}

export interface MarkerManager extends Disposable {
  state: MarkerManagerState;
  actions: MarkerManagerActions;
}
