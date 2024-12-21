// src/features/arrangement/utils/validation.ts
import * as Tone from "tone";
import { ArrangementState } from "../types";
import { Time } from "tone/build/esm/core/type/Units";

export const validateTrackOrder = (
  currentOrder: string[],
  trackId: string,
  newIndex: number,
): {
  isValid: boolean;
  error?: string;
  newOrder?: string[];
} => {
  if (newIndex < 0 || newIndex >= currentOrder.length) {
    return {
      isValid: false,
      error: "Invalid track index",
    };
  }

  try {
    const newOrder = [...currentOrder];
    const currentIndex = currentOrder.indexOf(trackId);

    if (currentIndex === -1) {
      return {
        isValid: false,
        error: "Track not found",
      };
    }

    newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, trackId);

    return {
      isValid: true,
      newOrder,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Order calculation failed: ${error.message}`,
    };
  }
};

export const validateTrackHeight = (
  height: number,
  viewSettings: ArrangementState["viewSettings"],
): boolean => {
  return (
    height >= viewSettings.minimumHeight &&
    height >= viewSettings.foldedHeight &&
    isFinite(height)
  );
};

export const validateTrackSelection = (
  selectedTracks: Set<string>,
  state: ArrangementState,
): boolean => {
  return Array.from(selectedTracks).every(
    (id) => state.tracks[id] !== undefined,
  );
};

export const validateAutomationLanes = (
  lanes: Record<string, string[]>,
  state: ArrangementState,
): boolean => {
  return Object.entries(lanes).every(([trackId, laneIds]) => {
    const track = state.tracks[trackId];
    return (
      track &&
      Array.isArray(laneIds) &&
      laneIds.every((id) => typeof id === "string")
    );
  });
};

export const validateDragState = (
  dragState: ArrangementState["dragState"],
): boolean => {
  if (!dragState) return true;

  return (
    ["clip", "automation", null].includes(dragState.type) &&
    typeof dragState.sourceId === "string" &&
    (dragState.targetId === null || typeof dragState.targetId === "string") &&
    (dragState.position === null || typeof dragState.position === "number")
  );
};

export const validateViewSettings = (
  settings: ArrangementState["viewSettings"],
): boolean => {
  return (
    settings.defaultHeight > settings.minimumHeight &&
    settings.minimumHeight > 0 &&
    settings.foldedHeight > 0 &&
    settings.foldedHeight <= settings.minimumHeight &&
    Object.values(settings.trackHeights).every((h) =>
      validateTrackHeight(h, settings),
    )
  );
};

export const validateTimeRange = (time: Time): boolean => {
  try {
    const seconds = Tone.Time(time).toSeconds();
    return isFinite(seconds) && seconds >= 0;
  } catch {
    return false;
  }
};

// Helper function to validate entire arrangement state
export const validateArrangementState = (
  state: ArrangementState,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate track existence
  if (!state.trackOrder.every((id) => state.tracks[id])) {
    errors.push("Track order contains invalid track IDs");
  }

  // Validate folded tracks
  if (!Array.from(state.foldedTracks).every((id) => state.tracks[id])) {
    errors.push("Folded tracks contains invalid track IDs");
  }

  // Validate selected tracks
  if (!Array.from(state.selectedTracks).every((id) => state.tracks[id])) {
    errors.push("Selected tracks contains invalid track IDs");
  }

  // Validate automation lanes
  if (!validateAutomationLanes(state.visibleAutomationLanes, state)) {
    errors.push("Invalid automation lane configuration");
  }

  // Validate drag state
  if (!validateDragState(state.dragState)) {
    errors.push("Invalid drag state");
  }

  // Validate view settings
  if (!validateViewSettings(state.viewSettings)) {
    errors.push("Invalid view settings");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
