// src/core/interfaces/pattern/core.ts
import { Identifiable, TimelineObject, Disposable } from "../base";
import {
  PatternTrack,
  SerializableTrack,
  TrackActions,
  EventActions,
  SequenceEvent,
} from "./index";
import { FollowAction, LaunchQuantization } from "../../types/common";
import { Time } from "tone/build/esm/core/type/Units";
import * as Tone from "tone";

export interface Pattern extends Identifiable, TimelineObject, Disposable {
  tracks: PatternTrack[];
  timeSignature: [number, number];
  part?: Tone.Part<SequenceEvent>;
  sceneAssociation?: PatternSceneAssociation;
  followAction?: FollowActionConfig;
  quantization?: LaunchQuantization;
}

export interface PatternState {
  id: string;
  name: string;
  startTime: Time;
  duration: Time;
  timeSignature: [number, number];
  tracks: SerializableTrack[];
}

export interface PatternsState {
  patterns: PatternState[];
  currentPatternId: string | null;
}

export interface PatternSceneAssociation {
  sceneId: string;
  trackId: string;
  clipSlot: number;
}

export interface FollowActionConfig {
  action: FollowAction;
  targetId?: string;
  chance: number;
  time: Time;
}

export interface PatternActions extends TrackActions, EventActions {
  createPattern(name: string, timeSignature: [number, number]): string;
  deletePattern(id: string): void;
  duplicatePattern(id: string): string;
  updatePattern(
    id: string,
    updates: Partial<Omit<Pattern, "tracks" | "part">>,
  ): void;
  setCurrentPattern(id: string | null): void;
  assignToScene(
    patternId: string,
    sceneId: string,
    trackId: string,
    clipSlot: number,
  ): void;
  removeFromScene(patternId: string): void;
  getPatternsInScene(sceneId: string): Pattern[];

  getPattern(id: string): Pattern | undefined;
  getCurrentPattern(): Pattern | null;
  getPatterns(): Pattern[];
}
