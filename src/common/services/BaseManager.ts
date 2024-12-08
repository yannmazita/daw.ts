// src/common/services/BaseManager.ts

export class BaseManager<T> {
  state: T;
  onStateChange?: (state: T) => void;

  constructor(initialState: T) {
    this.state = initialState;
  }

  public onStateUpdate(callback: (state: T) => void): () => void {
    this.onStateChange = callback;
    // Immediate state sync
    callback(this.state);
    // Return cleanup function
    return () => {
      this.onStateChange = undefined;
    };
  }

  protected updateState(updates: Partial<T>): void {
    this.state = { ...this.state, ...updates };
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }
}
