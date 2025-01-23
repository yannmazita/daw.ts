// src/features/clips/services/ClipEngine.ts
import { ClipState } from "../types";

export class ClipEngineImpl {
  private disposed = false;

  dispose(state: ClipState): void {
    if (this.disposed) return;

    this.disposed = true;
  }
}
