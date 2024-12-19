// src/core/engines/EngineManager.ts
import { TransportEngineImpl } from "@/features/transport/services/TransportEngine";
import { ClipEngineImpl } from "@/features/clips/services/ClipEngine";
import { MixEngineImpl } from "@/features/mix/services/MixEngine";
import { AutomationEngineImpl } from "@/features/automation/services/AutomationEngine";
import { ArrangementEngineImpl } from "@/features/arrangement/services/ArrangementEngine";

export class EngineManager {
  private static instance: EngineManager | null;

  private _transport: TransportEngineImpl;
  private _clips: ClipEngineImpl;
  private _mix: MixEngineImpl;
  private _automation: AutomationEngineImpl;
  private _arrangement: ArrangementEngineImpl;
  private _initialized = false;

  private constructor() {
    // Initialize engines in dependency order
    this._transport = new TransportEngineImpl();
    this._mix = new MixEngineImpl();
    this._clips = new ClipEngineImpl();
    this._automation = new AutomationEngineImpl();
    this._arrangement = new ArrangementEngineImpl(
      this._transport,
      this._clips,
      this._mix,
      this._automation,
    );
    this._initialized = true;
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

  public get clips() {
    return this._clips;
  }

  public get mix() {
    return this._mix;
  }

  public get automation() {
    return this._automation;
  }

  public get arrangement() {
    return this._arrangement;
  }

  public dispose(): void {
    if (!this._initialized) return;

    // Dispose in reverse order of initialization
    this._arrangement.dispose();
    this._automation.dispose();
    this._clips.dispose();
    this._mix.dispose();
    this._transport.dispose();

    this._initialized = false;
    EngineManager.instance = null;
  }
}

// Convenience hooks for components
export const useTransportEngine = () => {
  return EngineManager.getInstance().transport;
};

export const useClipEngine = () => {
  return EngineManager.getInstance().clips;
};

export const useMixEngine = () => {
  return EngineManager.getInstance().mix;
};

export const useAutomationEngine = () => {
  return EngineManager.getInstance().automation;
};

export const useArrangementEngine = () => {
  return EngineManager.getInstance().arrangement;
};
