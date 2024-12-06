// src/features/patterns/types/pattern.ts

import { AutomationData } from "./automation";
import { Note } from "@/core/enums/note";
import { PatternTrackType } from "@/core/enums/PatternTrackType";

export interface BasePatternData {
  type: PatternTrackType;
}

export interface Step {
  index: number;
  velocity: number;
  active: boolean;
  note: Note;
  modulation: number;
  pitchBend: number;
  parameters: Record<string, number>;
}

export interface StepSequenceData extends BasePatternData {
  type: PatternTrackType.STEP_SEQUENCE;
  steps: Step[];
  gridResolution: number;
  loopLength: number;
  swing: number;
  defaultNote: Note;
  defaultVelocity: number;
}

export interface NoteEvent {
  note: Note;
  velocity: number;
  startTime: number;
  duration: number;
  parameters: Record<string, number>;
}

export interface PianoRollData extends BasePatternData {
  type: PatternTrackType.PIANO_ROLL;
  notes: NoteEvent[];
  timeSignature: [number, number];
  quantization: number;
}

export interface AudioData extends BasePatternData {
  type: PatternTrackType.AUDIO;
  sampleId: string;
  startOffset: number;
  duration: number;
  timeStretch: boolean;
  pitch: number;
}

export type PatternData = StepSequenceData | PianoRollData | AudioData;

export interface PatternTrack {
  id: string;
  name: string;
  type: PatternTrackType;
  mixerChannelId: string;
  instrumentId: string;
  muted: boolean;
  solo: boolean;
  data: PatternData;
  automationData: AutomationData[];
}

export interface Pattern {
  id: string;
  name: string;
  color: string;
  length: number; // in bars
  timeSignature: [number, number];
  tracks: PatternTrack[];
}

// When creating new steps, we should use these defaults
export const DEFAULT_STEP: Omit<Step, "index"> = {
  active: false,
  note: Note.C4,
  velocity: 100,
  modulation: 0,
  pitchBend: 0,
  parameters: {},
};

export const DEFAULT_STEP_SEQUENCE_DATA: Omit<StepSequenceData, "type"> = {
  steps: [],
  gridResolution: 16,
  loopLength: 16,
  swing: 0,
  defaultNote: Note.C4,
  defaultVelocity: 100,
};
