// src/features/composition/types.ts
import { TransportEngine } from "../transport/types";
import { SamplerEngine } from "../sampler/types";
import { ClipEngine } from "../clips/types";
import { MixEngine } from "../mix/types";
import { AutomationEngine } from "../automation/types";

export interface CompositionState {}

export interface CompositionEngine {
  transportEngine: TransportEngine;
  mixEngine: MixEngine;
  samplerEngine: SamplerEngine;
  clipEngine: ClipEngine;
  automationEngine: AutomationEngine;

  // Cleanup
  dispose(): Promise<void>;
}
