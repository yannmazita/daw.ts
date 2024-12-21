// src/features/arrangement/utils/dragUtils.ts
import { ArrangementState } from "../types";
import { Time } from "tone/build/esm/core/type/Units";

export const createDragState = (
  type: "clip" | "automation",
  sourceId: string,
): ArrangementState["dragState"] => ({
  type,
  sourceId,
  targetId: null,
  position: null,
});

export const updateDragPosition = (
  dragState: ArrangementState["dragState"],
  position: Time | null,
  targetId: string | null,
): ArrangementState["dragState"] => {
  if (!dragState) return null;

  return {
    ...dragState,
    position,
    targetId,
  };
};

export const isDraggable = (
  trackId: string,
  state: ArrangementState,
): boolean => {
  const track = state.tracks[trackId];
  return track && track.type !== "master";
};

export const getDropTarget = (
  y: number,
  state: ArrangementState,
): string | null => {
  let currentY = 0;

  for (const trackId of state.trackOrder) {
    const track = state.tracks[trackId];
    if (!track.isVisible) continue;

    const height =
      state.viewSettings.trackHeights[trackId] ||
      state.viewSettings.defaultHeight;

    if (y >= currentY && y < currentY + height) {
      return trackId;
    }

    currentY += height;
  }

  return null;
};
