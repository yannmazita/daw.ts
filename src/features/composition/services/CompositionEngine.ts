// src/features/composition/services/CompositionEngine.ts
import { CompositionEngine } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { CompositionTransportService } from "./CompositionTransportService";
import { CompositionMixService } from "./CompositionMixService";
import { CompositionClipService } from "./CompositionClipService";
import { CompositionAutomationService } from "./CompositionAutomationService";
import { CompositionTrackService } from "./CompositionTrackService";
import { TrackEngine } from "@/features/tracks/types";

export class CompositionEngineImpl implements CompositionEngine {
  private disposed = false;
  private readonly transportService: CompositionTransportService;
  private readonly mixService: CompositionMixService;
  private readonly clipService: CompositionClipService;
  private readonly trackService: CompositionTrackService;
  private readonly automationService: CompositionAutomationService;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly mixEngine: MixEngine,
    public readonly clipEngine: ClipEngine,
    public readonly trackEngine: TrackEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.transportService = new CompositionTransportService(transportEngine);
    this.mixService = new CompositionMixService(mixEngine);
    this.clipService = new CompositionClipService(clipEngine);
    this.trackService = new CompositionTrackService(trackEngine);
    this.automationService = new CompositionAutomationService(automationEngine);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
