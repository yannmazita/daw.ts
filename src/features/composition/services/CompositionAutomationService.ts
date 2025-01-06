// src/features/composition/services/CompositionAutomationService.ts
import { AutomationEngine } from "@/features/automation/types";
import { CompositionState, Track } from "../types";
import { EngineState } from "@/core/stores/useEngineStore";
import { updateTrackState } from "../utils/stateUtils";

export class CompositionAutomationService {
  constructor(private readonly automationEngine: AutomationEngine) {}
}
