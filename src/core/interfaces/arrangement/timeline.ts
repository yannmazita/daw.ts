// src/core/interfaces/arrangement/timeline.ts
import { Time } from "tone/build/esm/core/type/Units";
import { Identifiable } from "../base";

export enum TimelineSnapUnit {
  NONE = "none",
  BAR = "bar",
  BEAT = "beat",
  SIXTEENTH = "16n",
  THIRTY_SECOND = "32n",
  TICKS = "ticks",
}

export interface TimelineTrack extends Identifiable {
  index: number;
  height: number;
  color?: string;
  isVisible: boolean;
  isFolded: boolean;
  parentId?: string; // For track groups/folders
  childIds: string[]; // For track groups/folders
}

export type TimelineItemType = "pattern" | "automation" | "marker" | "region";

export interface SelectedTimelineItems {
  itemIds: string[];
  itemType: TimelineItemType;
  trackId?: string;
}

export interface TimelineViewport {
  startTime: Time;
  endTime: Time;
  verticalScrollOffset: number;
  zoom: number;
}

export interface TimelineGridSettings {
  snapEnabled: boolean;
  snapUnit: TimelineSnapUnit;
  subdivisions: number;
  showGrid: boolean;
}

export interface TimelineManagerState {
  tracks: TimelineTrack[];
  viewport: TimelineViewport;
  grid: TimelineGridSettings;
  selection: SelectedTimelineItems | null;
}

export interface TimelineManagerActions {
  // Track Management
  createTrack(name: string, parentId?: string): string;
  deleteTrack(trackId: string): void;
  reorderTracks(trackIds: string[]): void;
  setTrackVisibility(trackId: string, isVisible: boolean): void;
  setTrackHeight(trackId: string, height: number): void;
  foldTrack(trackId: string, isFolded: boolean): void;

  // Track Groups
  createTrackGroup(name: string, trackIds: string[]): string;
  addToGroup(groupId: string, trackId: string): void;
  removeFromGroup(trackId: string): void;

  // Viewport Control
  setViewport(viewport: Partial<TimelineViewport>): void;
  zoomToFit(startTime: Time, endTime: Time): void;
  zoomToSelection(): void;
  scrollToTime(time: Time): void;

  // Grid Control
  setGridSettings(settings: Partial<TimelineGridSettings>): void;
  snapTimeToGrid(time: Time): Time;
  getGridLines(startTime: Time, endTime: Time): Time[];

  // Selection
  setSelection(selection: SelectedTimelineItems | null): void;
  clearSelection(): void;
  isSelected(itemId: string): boolean;

  // Utilities
  getTrackAt(yPosition: number): TimelineTrack | null;
  getTimeAtX(x: number): Time;
  getXAtTime(time: Time): number;
  getVisibleTracks(): TimelineTrack[];
  getTrackById(trackId: string): TimelineTrack | undefined;
  validateTrackOrder(trackIds: string[]): boolean;
}

export interface TimelineManager extends Disposable {
  state: TimelineManagerState;
  actions: TimelineManagerActions;
}
