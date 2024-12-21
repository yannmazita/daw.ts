// src/features/arrangement/utils/heightUtils.ts
import { ArrangementState } from "../types";

export const calculateTrackHeight = (
  trackId: string,
  state: ArrangementState,
): number => {
  const track = state.tracks[trackId];
  if (!track) return 0;

  // If track is folded, return folded height
  if (state.foldedTracks.has(trackId)) {
    return state.viewSettings.foldedHeight;
  }

  // Return custom height or default
  return (
    state.viewSettings.trackHeights[trackId] || state.viewSettings.defaultHeight
  );
};

export const calculateTotalHeight = (state: ArrangementState): number => {
  return state.trackOrder.reduce(
    (total, trackId) => total + calculateTrackHeight(trackId, state),
    0,
  );
};

export const getTrackAtY = (
  y: number,
  state: ArrangementState,
): string | null => {
  let currentY = 0;

  for (const trackId of state.trackOrder) {
    const height = calculateTrackHeight(trackId, state);
    if (y >= currentY && y < currentY + height) {
      return trackId;
    }
    currentY += height;
  }

  return null;
};
