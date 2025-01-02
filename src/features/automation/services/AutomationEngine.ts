// src/features/automation/AutomationEngine.ts

import { AutomationEngine } from "../types";

export class AutomationEngineImpl implements AutomationEngine {
  constructor(private disposed = false) {}

  dispose(): void {
    if (this.disposed) {
      console.warn("CompositionEngine already disposed");
      return;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
