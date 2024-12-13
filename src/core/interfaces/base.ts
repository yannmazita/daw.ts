// src/core/interfaces/base.ts

import { Time } from "tone/build/esm/core/type/Units";

/** Base interface for all identifiable entities */
export interface Identifiable {
  id: string;
  name: string;
}

/** Base interface for audio routing nodes */
export interface AudioNode {
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

/** Base interface for timeline objects */
export interface TimelineObject {
  startTime: Time;
  duration: Time;
}

/** Base interface for audio processing modules */
export interface AudioProcessor {
  bypass: boolean;
  wet: number;
}

/** Base interface for meter/analysis nodes */
export interface AnalysisNode {
  isEnabled: boolean;
  smoothing: number;
  channels: number;
}

/** Base interface for serializable objects */
export interface Serializable {
  toJSON(): unknown;
  fromJSON(data: unknown): void;
}

/** Base interface for disposable resources */
export interface Disposable {
  dispose(): void;
}
