// src/features/composition/utils/cleanupUtils.ts

import { Track } from "../types";

export const disposeCompositionTrack = (track: Track): void => {
  try {
    // Dispose track nodes
    track.input.dispose();
    track.channel.dispose();
    track.meter.dispose();
    track.panner.dispose();
  } catch (error) {
    console.error("Error disposing composition track:", error);
    throw error;
  }
};
