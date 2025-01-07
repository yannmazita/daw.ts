// src/features/composition/types.ts
import { TransportEngine } from "../transport/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";
import { TrackEngine } from "../tracks/types";

export interface CompositionState {}

export interface PersistableCompositionState {}

export interface CompositionEngine {
  transportEngine: TransportEngine;
  mixEngine: MixEngine;
  clipEngine: ClipEngine;
  trackEngine: TrackEngine;
  automationEngine: AutomationEngine;

  // Cleanup
  dispose(): void;
}
