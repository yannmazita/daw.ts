// src/features/arrangement/types.ts
import { Time } from "tone/build/esm/core/type/Units";
import { TransportEngine } from "../transport/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";

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

  // Selection
  setSelection(selection: Partial<ArrangementState["selection"]>): void;

  // View
  setViewRange(startTime: Time, endTime: Time): void;
  setZoom(zoom: number): void;

  // State
  getState(): ArrangementState;
  dispose(): void;
}
