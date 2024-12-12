// src/core/interfaces/session.ts

import { Time } from "tone/build/esm/core/type/Units";
import {
  ClipState,
  FollowActionConfig,
  LaunchQuantization,
} from "../types/common";

export interface ClipSlot {
  id: string;
  patternId: string | null;
  state: ClipState;
  color?: string;
  name?: string;
  startTime?: Time;
  loopLength?: Time;
  followAction?: FollowActionConfig;
}

export interface SessionTrackState {
  id: string;
  name: string;
  color?: string;
  mixerChannelId: string;
  clipSlots: ClipSlot[];
  isFolded: boolean;
  isArmed: boolean;
  monitoringMode: "in" | "auto" | "off";
}

export interface SceneState {
  id: string;
  name: string;
  color?: string;
  tempo?: number;
  timeSignature?: [number, number];
}

export interface SessionState {
  sessionTracks: SessionTrackState[];
  scenes: SceneState[];
  clipLaunchQuantization: LaunchQuantization;
  sceneFollowAction?: FollowActionConfig;
  focusedTrackId?: string;
  focusedClipId?: string;
  selectedClipIds: Set<string>;
}

export interface SessionActions {
  // Track Management
  createTrack: (name: string) => string;
  deleteTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<SessionTrackState>) => void;
  moveTrack: (id: string, newIndex: number) => void;

  // Clip Management
  createClip: (trackId: string, slotIndex: number, patternId: string) => string;
  deleteClip: (trackId: string, slotIndex: number) => void;
  updateClip: (
    trackId: string,
    slotIndex: number,
    updates: Partial<ClipSlot>,
  ) => void;
  duplicateClip: (
    sourceTrackId: string,
    sourceSlotIndex: number,
    targetTrackId: string,
    targetSlotIndex: number,
  ) => string;

  // Scene Management
  createScene: (name: string) => string;
  deleteScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<SceneState>) => void;
  moveScene: (id: string, newIndex: number) => void;

  // Playback Control
  launchClip: (trackId: string, slotIndex: number) => void;
  stopClip: (trackId: string, slotIndex: number) => void;
  launchScene: (sceneIndex: number) => Promise<void>;
  stopScene: (sceneIndex: number) => void;
  stopAllClips: () => void;

  // Recording
  armTrack: (trackId: string, armed: boolean) => void;
  setMonitoring: (trackId: string, mode: "in" | "auto" | "off") => void;
  recordIntoSlot: (trackId: string, slotIndex: number) => void;

  // Selection and Focus
  setFocusedTrack: (trackId: string | undefined) => void;
  setFocusedClip: (clipId: string | undefined) => void;
  selectClip: (clipId: string, addToSelection?: boolean) => void;
  deselectClip: (clipId: string) => void;
  clearSelection: () => void;

  // Configuration
  setClipLaunchQuantization: (quantization: LaunchQuantization) => void;
  setSceneFollowAction: (config: FollowActionConfig | undefined) => void;

  // Utility
  getClipAt: (trackId: string, slotIndex: number) => ClipSlot | null;
  getTrack: (id: string) => SessionTrackState | undefined;
  getScene: (id: string) => SceneState | undefined;
  dispose: () => void;
}
