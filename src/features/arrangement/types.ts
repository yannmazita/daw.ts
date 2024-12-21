// src/features/arrangement/types.ts
import { Time } from "tone/build/esm/core/type/Units";
import { TransportEngine } from "../transport/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";

export const DragTypes = {
  TRACK: "track",
  CLIP: "clip",
  AUTOMATION_POINT: "automation-point",
} as const;

export type DragType = (typeof DragTypes)[keyof typeof DragTypes];

export interface Track {
  id: string;
  type: "audio" | "midi" | "return" | "master";
  name: string;
  color?: string;
  index: number;

  // Visual
  height: number;
  isVisible: boolean;
  isFolded: boolean;

  // Audio
  mixerChannelId: string;

  // Content
  clipIds: string[];
  automationIds: string[];
}

export interface ArrangementState {
  tracks: Record<string, Track>;
  trackOrder: string[];
  foldedTracks: Set<string>;
  selectedTracks: Set<string>;
  visibleAutomationLanes: Record<string, string[]>; // trackId -> laneIds
  dragState: {
    type: "clip" | "automation" | null;
    sourceId: string;
    targetId: string | null;
    position: Time | null;
  } | null;
  viewSettings: {
    trackHeights: Record<string, number>;
    defaultHeight: number;
    minimumHeight: number;
    foldedHeight: number;
  };
}

export interface PersistableArrangementState {
  tracks: Record<string, Track>;
  returnTracks: string[];
  masterTrackId: string;
  trackOrder: string[];

  selection: {
    trackIds: string[];
    clipIds: string[];
    automationPoints: {
      laneId: string;
      pointId: string;
    }[];
  };

  viewState: {
    startTime: Time;
    endTime: Time;
    verticalScroll: number;
    zoom: number;
  };
}

export interface ArrangementEngine {
  transportEngine: TransportEngine;
  clipEngine: ClipEngine;
  mixEngine: MixEngine;
  automationEngine: AutomationEngine;

  // Track operations
  createTrack(type: Track["type"], name: string): string;
  deleteTrack(trackId: string): void;
  moveTrack(trackId: string, newIndex: number): void;
  toggleTrackFold(trackId: string): void;
  setTrackHeight(trackId: string, height: number): void;
  getVisibleHeight(): number;
  getTotalHeight(): number;
  getTrackHeight(trackId: string): number;

  // Selection
  setSelection(trackIds: Set<string>): void;

  // Automation
  toggleAutomationLane(trackId: string, laneId: string): void;

  // State
  getState(): ArrangementState;
  dispose(): void;
}
