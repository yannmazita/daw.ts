// src/features/composition/utils/orderUtils.ts
import { CompositionState } from "../types";

export const moveTrackInOrder = (
  trackId: string,
  newIndex: number,
  state: CompositionState,
): string[] => {
  const currentIndex = state.trackOrder.indexOf(trackId);
  if (currentIndex === -1) return state.trackOrder;

  const newOrder = [...state.trackOrder];
  newOrder.splice(currentIndex, 1);
  newOrder.splice(newIndex, 0, trackId);
  return newOrder;
};
