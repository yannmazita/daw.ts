// src/features/sequencer/hooks/playback/types.ts

import { PlaybackMode } from "@/core/interfaces/sequencer";
import { Pattern } from "@/core/interfaces/pattern";
import { AutomationCurve } from "@/core/interfaces/automation";
import { SequenceStatus } from "@/core/enums";
import * as Tone from "tone";

export type AudioContextLatencyCategory =
  | "interactive"
  | "playback"
  | "balanced";

export interface ScheduledEvent {
  id: number;
  time: number;
  type: "note" | "automation" | "pattern_change";
  data: any;
}

export interface PlaybackControllerConfig {
  scheduleAheadTime: number;
  updateInterval: number;
  latencyHint?: number | AudioContextLatencyCategory;
}

export interface PlaybackContext {
  currentTime: number;
  scheduleAheadTime: number;
  pattern: Pattern | { mode: PlaybackMode; length: number } | null;
  mode: PlaybackMode;
  status: SequenceStatus;
  bpm: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

export interface SchedulerConfig {
  scheduleAheadTime: number;
  updateInterval: number;
}

export interface AutomationEvent {
  parameter: Tone.Param<any>;
  time: number;
  value: number;
  curve: AutomationCurve;
}

export interface TrackScheduleContext {
  startTime: number;
  endTime: number;
  trackId: string;
  pattern: Pattern;
  scheduledEvents: Set<number>;
}
