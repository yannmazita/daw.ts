// src/features/mixer/utils/orderUtils.ts
import { MixState } from "../types";

export const moveMixerTrackInOrder = (
  trackId: string,
  newIndex: number,
  state: MixState,
): string[] => {
  const currentIndex = state.mixerTrackOrder.indexOf(trackId);
  if (currentIndex === -1) return state.mixerTrackOrder;

  const newOrder = [...state.mixerTrackOrder];
  newOrder.splice(currentIndex, 1);
  newOrder.splice(newIndex, 0, trackId);
  return newOrder;
};
