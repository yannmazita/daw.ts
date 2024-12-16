// src/features/arrangement/types.ts
import { Time } from "tone/build/esm/core/type/Units";
import { TransportEngine } from "../transport/types";
import {
  ArrangementClip,
  ClipContent,
  ClipEngine,
  PersistableClipContent,
} from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine, AutomationLane } from "../automation/types";

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
  clips: ArrangementClip[];
  automationLanes: AutomationLane[];
}

export interface ArrangementState {
  tracks: Record<string, Track>;
  returnTracks: string[];
  masterTrackId: string;
  trackOrder: string[];

  clips: Record<string, ArrangementClip>;
  clipContents: Record<string, ClipContent>;

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

  clips: Record<string, ArrangementClip>;
  clipContents: Record<string, PersistableClipContent>;

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

  // Clip operations
  addClip(trackId: string, contentId: string, startTime: Time): string;
  removeClip(clipId: string): void;
  moveClip(clipId: string, newTime: Time): void;

  // Selection
  setSelection(selection: Partial<ArrangementState["selection"]>): void;

  // View
  setViewRange(startTime: Time, endTime: Time): void;
  setZoom(zoom: number): void;

  // State
  getState(): ArrangementState;
  dispose(): void;
}
