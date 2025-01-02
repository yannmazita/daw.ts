// src/features/composition/utils/validation.ts
import * as Tone from "tone";
import { CompositionState } from "../types";
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
      error: "Order calculation failed",
    };
  }
};

export const validateAutomationLanes = (
  lanes: Record<string, string[]>,
  state: CompositionState,
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

export const validateTimeRange = (time: Time): boolean => {
  try {
    const seconds = Tone.Time(time).toSeconds();
    return isFinite(seconds) && seconds >= 0;
  } catch {
    return false;
  }
};

// Helper function to validate entire composition state
export const validateCompositionState = (
  state: CompositionState,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate track existence
  if (!state.trackOrder.every((id) => state.tracks[id])) {
    errors.push("Track order contains invalid track IDs");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
