// src/core/engines/EngineManager.ts
import { TransportEngineImpl } from "@/features/transport/services/TransportEngine";
import { ClipEngineImpl } from "@/features/clips/services/ClipEngine";
import { MixEngineImpl } from "@/features/mix/services/MixEngine";
import { AutomationEngineImpl } from "@/features/automation/services/AutomationEngine";
import { CompositionEngineImpl } from "@/features/composition/services/CompositionEngine";

export class EngineManager {
  private static instance: EngineManager | null;

  private _transport: TransportEngineImpl;
  private _mix: MixEngineImpl;
  private _clips: ClipEngineImpl;
  private _automation: AutomationEngineImpl;
  private _composition: CompositionEngineImpl;
  private _initialized = false;

  private constructor() {
    // Initialize engines in dependency order
    this._transport = new TransportEngineImpl();
    console.log("Transport Engine initialized");
    this._mix = new MixEngineImpl();
    console.log("Mix Engine initialized");
    this._clips = new ClipEngineImpl();
    console.log("Clip Engine initialized");
    this._automation = new AutomationEngineImpl();
    console.log("Automation Engine initialized");
    this._composition = new CompositionEngineImpl(
      this._transport,
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

  public dispose(): void {
    if (!this._initialized) return;

    // Dispose in reverse order of initialization
    this._composition.dispose();
    this._automation.dispose();
    this._clips.dispose();
    this._mix.dispose();
    this._transport.dispose();

    this._initialized = false;
    EngineManager.instance = null;
  }
}

export const useTransportEngine = () => {
  return EngineManager.getInstance().transport;
};

export const useMixEngine = () => {
  return EngineManager.getInstance().mix;
};

export const useClipEngine = () => {
  return EngineManager.getInstance().clips;
};

export const useAutomationEngine = () => {
  return EngineManager.getInstance().automation;
};

export const useCompositionEngine = () => {
  return EngineManager.getInstance().composition;
};
