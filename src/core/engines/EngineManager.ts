// src/core/engines/EngineManager.ts
import { TransportEngineImpl } from "@/features/transport/services/TransportEngine";
import { SamplerEngineImpl } from "@/features/sampler/services/SamplerEngine";
import { ClipEngineImpl } from "@/features/clips/services/ClipEngine";
import { MixEngineImpl } from "@/features/mix/services/MixEngine";
import { AutomationEngineImpl } from "@/features/automation/services/AutomationEngine";
import { CompositionEngineImpl } from "@/features/composition/services/CompositionEngine";
import { useEngineStore } from "../stores/useEngineStore";

export class EngineManager {
  private static instance: EngineManager | null;

  private _audioContext = new AudioContext();
  private _transport: TransportEngineImpl;
  private _sampler: SamplerEngineImpl;
  private _mix: MixEngineImpl;
  private _clips: ClipEngineImpl;
  private _automation: AutomationEngineImpl;
  private _composition: CompositionEngineImpl;
  private _initialized = false;

  private constructor() {
    // Initialize engines in dependency order
    this._transport = new TransportEngineImpl(
      useEngineStore.getState().transport,
      this._audioContext,
    );
    console.log("Transport Engine initialized");
    this._sampler = new SamplerEngineImpl(this._audioContext, this._transport);
    console.log("Sampler Engine initialized");
    this._mix = new MixEngineImpl(this._audioContext);
    console.log("Mix Engine initialized");
    this._clips = new ClipEngineImpl(
      this._audioContext,
      this._mix.getRoutingService(),
    );
    console.log("Clip Engine initialized");
    this._automation = new AutomationEngineImpl();
    console.log("Automation Engine initialized");
    this._composition = new CompositionEngineImpl(
      this._transport,
      this._sampler,
      this._mix,
      this._clips,
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

  public get composition() {
    return this._composition;
  }

  public async dispose(): Promise<void> {
    if (!this._initialized) return;

    // Dispose in reverse order of initialization
    await this._composition.dispose();
    this._automation.dispose();
    this._clips.dispose(useEngineStore.getState().clips);
    await this._mix.dispose(useEngineStore.getState().mix);
    await this._sampler.dispose(useEngineStore.getState().sampler);
    await this._transport.dispose(useEngineStore.getState().transport);

    this._initialized = false;
    EngineManager.instance = null;
  }
}

export const useCompositionEngine = () => {
  return EngineManager.getInstance().composition;
};
