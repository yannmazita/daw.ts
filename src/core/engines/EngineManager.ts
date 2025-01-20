// src/core/engines/EngineManager.ts
import { TransportEngineImpl } from "@/features/transport/services/TransportEngine";
import { SamplerEngineImpl } from "@/features/sampler/services/SamplerEngine";
import { ClipEngineImpl } from "@/features/clips/services/ClipEngine";
import { MixEngineImpl } from "@/features/mix/services/MixEngine";
import { AutomationEngineImpl } from "@/features/automation/services/AutomationEngine";
import { TrackEngineImpl } from "@/features/tracks/services/TrackEngine";
import { CompositionEngineImpl } from "@/features/composition/services/CompositionEngine";
import { useEngineStore } from "../stores/useEngineStore";

export class EngineManager {
  private static instance: EngineManager | null;

  private _transport: TransportEngineImpl;
  private _sampler: SamplerEngineImpl;
  private _mix: MixEngineImpl;
  private _clips: ClipEngineImpl;
  private _automation: AutomationEngineImpl;
  private _tracks: TrackEngineImpl;
  private _composition: CompositionEngineImpl;
  private _initialized = false;

  private constructor() {
    // Initialize engines in dependency order
    this._transport = new TransportEngineImpl(
      useEngineStore.getState().transport,
    );
    console.log("Transport Engine initialized");
    this._sampler = new SamplerEngineImpl();
    console.log("Sampler Engine initialized");
    this._mix = new MixEngineImpl();
    console.log("Mix Engine initialized");
    this._clips = new ClipEngineImpl(this._sampler);
    console.log("Clip Engine initialized");
    this._automation = new AutomationEngineImpl();
    console.log("Automation Engine initialized");
    this._tracks = new TrackEngineImpl();
    console.log("Track Engine initialized");
    this._composition = new CompositionEngineImpl(
      this._transport,
      this._sampler,
      this._mix,
      this._clips,
      this._tracks,
      this._automation,
    );
    console.log("Composition Engine initialized");
    this._initialized = true;
    console.log("Engine Manager initialized");
  }

  public static getInstance(): EngineManager {
    if (!EngineManager.instance) {
      EngineManager.instance = new EngineManager();
    }
    return EngineManager.instance;
  }

  public get transport() {
    return this._transport;
  }

  public get sampler() {
    return this._sampler;
  }

  public get mix() {
    return this._mix;
  }

  public get clips() {
    return this._clips;
  }

  public get automation() {
    return this._automation;
  }

  public get tracks() {
    return this._tracks;
  }

  public get composition() {
    return this._composition;
  }

  public async dispose(): Promise<void> {
    if (!this._initialized) return;

    // Dispose in reverse order of initialization
    await this._composition.dispose();
    this._tracks.dispose(useEngineStore.getState().tracks);
    this._automation.dispose();
    this._clips.dispose(useEngineStore.getState().clips);
    this._mix.dispose(useEngineStore.getState().mix);
    this._sampler.dispose(useEngineStore.getState().sampler);
    await this._transport.dispose(useEngineStore.getState().transport);

    this._initialized = false;
    EngineManager.instance = null;
  }
}

export const useCompositionEngine = () => {
  return EngineManager.getInstance().composition;
};
