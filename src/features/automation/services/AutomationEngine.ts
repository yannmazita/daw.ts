// src/features/automation/AutomationEngine.ts

import { AutomationEngine } from "../types";

export class AutomationEngineImpl implements AutomationEngine {
  constructor(private disposed = false) {}

  dispose(): void {
    if (this.disposed) {
      console.warn("ArrangementEngine already disposed");
      return;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("ArrangementEngine is disposed");
    }
  }
}
