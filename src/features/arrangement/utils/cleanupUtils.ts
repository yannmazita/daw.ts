// src/features/arrangement/utils/cleanupUtils.ts

import { Track } from "../types";

export const disposeArrangementTrack = (track: Track): void => {
  try {
    // Dispose track nodes
    track.input.dispose();
    track.channel.dispose();
    track.meter.dispose();
    track.panner.dispose();
  } catch (error) {
    console.error("Error disposing arrangement track:", error);
    throw error;
  }
};
