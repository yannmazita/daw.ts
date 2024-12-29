// src/features/arrangement/types.ts
import { TransportEngine } from "../transport/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";
import { Channel, Gain, Meter } from "tone";

export const DragTypes = {
  TRACK: "track",
  CLIP: "clip",
  AUTOMATION_POINT: "automation-point",
} as const;

export interface ClipDragItem {
  type: typeof DragTypes.CLIP;
  id: string;
  trackId: string;
  contentId: string;
  startTime: number;
  duration: number;
}

export type DragType = (typeof DragTypes)[keyof typeof DragTypes];

export interface BaseTrack {
  id: string;
  name: string;
  index: number;

  // Content
  clipIds: string[];
  automationIds: string[];

  // Tone.js nodes
  input: Gain;
  channel: Channel;
  meter: Meter;
}

export interface PersistableBaseTrack {
  id: string;
  name: string;
  index: number;
  clipIds: string[];
  automationIds: string[];
}

export interface AudioTrack extends BaseTrack {
  type: "audio";
}

export interface PersistableAudioTrack extends PersistableBaseTrack {
  type: "audio";
}

export interface MidiTrack extends BaseTrack {
  type: "midi";
}

export interface PersistableMidiTrack extends PersistableBaseTrack {
  type: "midi";
}

export type Track = AudioTrack | MidiTrack;

export type PersistableTrack = PersistableAudioTrack | PersistableMidiTrack;

export interface ArrangementState {
  tracks: Record<string, Track>;
  trackOrder: string[];
}

export interface PersistableArrangementState {
  tracks: Record<string, PersistableTrack>;
  trackOrder: string[];
}

export interface ArrangementEngine {
  transportEngine: TransportEngine;
  clipEngine: ClipEngine;
  mixEngine: MixEngine;
  automationEngine: AutomationEngine;

  // Track operations
  createTrack(type: Track["type"], name: string): string;
  updateTrack(trackId: string, updates: Partial<Track>): void;
  deleteTrack(trackId: string): void;
  moveTrack(trackId: string, newIndex: number): void;

  // State
  getState(): ArrangementState;
  dispose(): void;
}
