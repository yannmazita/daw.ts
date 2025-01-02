// src/features/instruments/utils/cleanupUtils.ts

import { Instrument } from "../types";

export const disposeInstrument = (instrument: Instrument): void => {
  try {
    // Dispose instrument node
    instrument.node.dispose();
  } catch (error) {
    console.error("Error disposing instrument");
    throw error;
  }
};
