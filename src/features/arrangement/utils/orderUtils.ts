// src/features/arrangement/utils/orderUtils.ts
import { ArrangementState } from "../types";

export const moveTrackInOrder = (
  trackId: string,
  newIndex: number,
  state: ArrangementState,
): string[] => {
  const currentIndex = state.trackOrder.indexOf(trackId);
  if (currentIndex === -1) return state.trackOrder;

  const newOrder = [...state.trackOrder];
  newOrder.splice(currentIndex, 1);
  newOrder.splice(newIndex, 0, trackId);
  return newOrder;
};

export const reorderTracks = (
  trackOrder: string[],
  state: ArrangementState,
): Record<string, number> => {
  return trackOrder.reduce(
    (indices, id, index) => ({
      ...indices,
      [id]: index,
    }),
    {},
  );
};

export const getNextTrackId = (
  trackId: string,
  state: ArrangementState,
): string | null => {
  const index = state.trackOrder.indexOf(trackId);
  return index < state.trackOrder.length - 1
    ? state.trackOrder[index + 1]
    : null;
};

export const getPreviousTrackId = (
  trackId: string,
  state: ArrangementState,
): string | null => {
  const index = state.trackOrder.indexOf(trackId);
  return index > 0 ? state.trackOrder[index - 1] : null;
};
