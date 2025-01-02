import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { createInstrumentNode } from "../utils/instrumentNodes";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { InstrumentEngine, Instrument, InstrumentState } from "../types";

export class InstrumentEngineImpl implements InstrumentEngine {
  private disposed = false;

  createInstrument(
    type: InstrumentName,
    name?: string,
    options?: InstrumentOptions,
  ): string {
    this.checkDisposed();
    const id = crypto.randomUUID();
    const node = createInstrumentNode(type, options);

    try {
      const newInstrument: Instrument = {
        id,
        name: name ?? `${type} ${id.slice(0, 6)}`,
        type,
        node,
        options,
      };

      useEngineStore.setState((state) => ({
        instruments: {
          ...state.instruments,
          instruments: {
            ...state.instruments.instruments,
            [id]: newInstrument,
          },
        },
      }));
      return id;
    } catch (error) {
      console.error("Failed to create instrument");
      throw error;
    }
  }

  updateInstrument(id: string, updates: Partial<Instrument>): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().instruments;
    const instrument = stateSnapshot.instruments[id];
    if (!instrument) {
      throw new Error(`Instrument not found`);
    }
    try {
      useEngineStore.setState((state) => ({
        instruments: {
          ...state.instruments,
          instruments: {
            ...state.instruments.instruments,
            [id]: {
              ...instrument,
              ...updates,
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to update instrument");
      throw error;
    }
  }

  deleteInstrument(id: string): void {
    this.checkDisposed();
    const stateSnapshot = useEngineStore.getState().instruments;
    if (!stateSnapshot.instruments[id]) {
      throw new Error(`Instrument not found`);
    }
    try {
      useEngineStore.setState((state) => {
        const { [id]: _, ...remainingInstruments } =
          state.instruments.instruments;
        return {
          instruments: {
            ...state.instruments,
            instruments: remainingInstruments,
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete instrument");
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("InstrumentEngine is disposed");
    }
  }

  getState(): InstrumentState {
    return useEngineStore.getState().instruments;
  }

  dispose(): void {
    this.disposed = true;
  }
}
