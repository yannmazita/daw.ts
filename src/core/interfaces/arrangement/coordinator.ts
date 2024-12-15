// src/core/interfaces/arrangement/coordinator.ts
import { Time } from "tone/build/esm/core/type/Units";
import { TimelinePattern } from "./patterns";
import { TimelineMarker, TimelineRegion } from "./markers";
import { AutomationLane } from "./automation";
import { TimelineTrack } from "./timeline";
import { Disposable } from "../base";

export type TimelineItem =
  | { type: "pattern"; id: string }
  | { type: "marker"; id: string }
  | { type: "region"; id: string }
  | { type: "automationPoint"; laneId: string; pointId: string };

export interface ArrangementState {
  viewportStartTime: Time;
  viewportEndTime: Time;
  viewportVerticalOffset: number;
  zoom: number;
  tracks: TimelineTrack[];
  patterns: TimelinePattern[];
  markers: TimelineMarker[];
  regions: TimelineRegion[];
  automationLanes: Record<string, AutomationLane>;
  selectedItems: TimelineItem[];
}

export interface ArrangementCoordinatorActions {
  // Timeline Operations
  setViewport(startTime: Time, endTime: Time, verticalOffset?: number): void;
  setZoom(zoom: number): void;
  scrollToTime(time: Time): void;
  fitToContent(): void;

  // Track Operations
  createTrack(name: string): string;
  deleteTrack(trackId: string): void;
  reorderTracks(trackIds: string[]): void;

  // Pattern Operations
  addPattern(trackId: string, patternId: string, startTime: Time): string;
  moveItems(items: TimelineItem[], deltaTime: Time): void;
  deleteItems(items: TimelineItem[]): void;
  duplicateItems(items: TimelineItem[]): TimelineItem[];
  splitPatternAtTime(patternId: string, time: Time): [string, string];

  // Automation Operations
  createAutomationLane(trackId: string, parameterName: string): string;
  addAutomationPoint(laneId: string, time: Time, value: number): string;

  // Marker/Region Operations
  addMarker(time: Time, name: string): string;
  addRegion(startTime: Time, duration: Time, name: string): string;
  setLoopRegion(regionId: string | null): void;

  // Selection
  selectItems(items: TimelineItem[]): void;
  clearSelection(): void;

  // Clipboard Operations
  copyItems(items: TimelineItem[]): void;
  cutItems(items: TimelineItem[]): void;
  paste(time: Time, trackId?: string): TimelineItem[];

  // Playback
  startPlayback(time?: Time): Promise<void>;
  stopPlayback(): void;
}

export interface ArrangementCoordinator extends Disposable {
  state: ArrangementState;
  actions: ArrangementCoordinatorActions;
}
