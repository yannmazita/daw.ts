//src/features/arrangement/utils/validation.ts
import * as Tone from "tone";
import { EngineState, useEngineStore } from "@/core/stores/useEngineStore";
import { ArrangementState } from "../types";
import { Time } from "tone/build/esm/core/type/Units";

export const validateAndCalculateNewOrder = (
  currentOrder: string[],
  trackId: string,
  newIndex: number,
): {
  isValid: boolean;
  error?: string;
  newOrder?: string[];
} => {
  // Basic validation
  if (newIndex < 0) {
    return {
      isValid: false,
      error: "New index cannot be negative",
    };
  }

  if (newIndex >= currentOrder.length) {
    return {
      isValid: false,
      error: "New index exceeds track count",
    };
  }

  const currentIndex = currentOrder.indexOf(trackId);
  if (currentIndex === -1) {
    return {
      isValid: false,
      error: "Track not found in current order",
    };
  }

  // No change needed if moving to same position
  if (currentIndex === newIndex) {
    return {
      isValid: false,
      error: "Track already at specified index",
    };
  }

  try {
    // Create new order by removing and inserting at new position
    const filteredOrder = currentOrder.filter((id) => id !== trackId);
    const newOrder = [
      ...filteredOrder.slice(0, newIndex),
      trackId,
      ...filteredOrder.slice(newIndex),
    ];

    // Validate new order
    if (newOrder.length !== currentOrder.length) {
      return {
        isValid: false,
        error: "Track order corruption detected",
      };
    }

    return {
      isValid: true,
      newOrder,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to calculate new order: ${error.message}`,
    };
  }
};

export const validateSelection = (
  selection: Partial<ArrangementState["selection"]>,
  state: EngineState,
): Partial<ArrangementState["selection"]> => {
  const validatedSelection: Partial<ArrangementState["selection"]> = {};

  // Track selection validation
  if (selection.trackIds !== undefined) {
    validatedSelection.trackIds = validateTrackSelection(
      selection.trackIds,
      state.arrangement,
    );
  }

  // Clip selection validation
  if (selection.clipIds !== undefined) {
    validatedSelection.clipIds = validateClipSelection(
      selection.clipIds,
      state.arrangement,
    );
  }

  // Automation point selection validation
  if (selection.automationPoints !== undefined) {
    validatedSelection.automationPoints = validateAutomationPointSelection(
      selection.automationPoints,
      state.arrangement,
    );
  }

  return validatedSelection;
};

export const validateTrackSelection = (
  trackIds: string[],
  arrangement: ArrangementState,
): string[] => {
  // Ensure array input
  if (!Array.isArray(trackIds)) {
    throw new Error("Track selection must be an array");
  }

  // Validate each track ID
  const invalidTracks = trackIds.filter((id) => !arrangement.tracks[id]);
  if (invalidTracks.length > 0) {
    throw new Error(
      `Invalid track IDs in selection: ${invalidTracks.join(", ")}`,
    );
  }

  enforceTrackSelectionRules(trackIds, arrangement);

  // Return validated and possibly filtered selection
  return [...new Set(trackIds)]; // Ensure uniqueness
};

export const validateClipSelection = (
  clipIds: string[],
  arrangement: ArrangementState,
): string[] => {
  if (!Array.isArray(clipIds)) {
    throw new Error("Clip selection must be an array");
  }

  // Check if clips exist in any track
  const invalidClips = clipIds.filter(
    (clipId) =>
      !Object.values(arrangement.tracks).some((track) =>
        track.clipIds.includes(clipId),
      ),
  );

  if (invalidClips.length > 0) {
    throw new Error(
      `Invalid clip IDs in selection: ${invalidClips.join(", ")}`,
    );
  }

  return [...new Set(clipIds)]; // Ensure uniqueness
};

export const validateAutomationPointSelection = (
  points: { laneId: string; pointId: string }[],
  arrangement: ArrangementState,
): { laneId: string; pointId: string }[] => {
  if (!Array.isArray(points)) {
    throw new Error("Automation point selection must be an array");
  }

  // Validate each automation point
  const invalidPoints = points.filter((point) => {
    // Check if automation lane exists
    const laneExists = Object.values(arrangement.tracks).some((track) =>
      track.automationIds.includes(point.laneId),
    );

    // Todo: additional point validation
    return !laneExists;
  });

  if (invalidPoints.length > 0) {
    throw new Error(
      `Invalid automation points in selection: ${invalidPoints
        .map((p) => `${p.laneId}:${p.pointId}`)
        .join(", ")}`,
    );
  }

  // Remove duplicates based on both laneId and pointId
  return uniqueAutomationPoints(points);
};

export const enforceTrackSelectionRules = (
  trackIds: string[],
  arrangement: ArrangementState,
): void => {
  // Master track selection rules
  if (trackIds.includes(arrangement.masterTrackId)) {
    // Prevent master track selection with other tracks
    if (trackIds.length > 1) {
      throw new Error("Master track cannot be selected with other tracks");
    }
  }
  // Return track selection rules
  const selectedReturnTracks = trackIds.filter((id) =>
    arrangement.returnTracks.includes(id),
  );

  // Limit return track selection
  if (selectedReturnTracks.length > 0) {
    // Todo: specific return track selection rules
  }

  // Todo: more rules
};

export const uniqueAutomationPoints = (
  points: { laneId: string; pointId: string }[],
): { laneId: string; pointId: string }[] => {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${point.laneId}:${point.pointId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const validateTimeRange = (
  startTime: Time,
  endTime: Time,
): { validatedStart: Time; validatedEnd: Time } => {
  // Convert to seconds for validation
  const startSeconds = Tone.Time(startTime).toSeconds();
  const endSeconds = Tone.Time(endTime).toSeconds();

  // Basic range validation
  if (!isFinite(startSeconds) || !isFinite(endSeconds)) {
    throw new Error("Invalid time values");
  }

  if (startSeconds < 0) {
    throw new Error("Start time cannot be negative");
  }

  if (endSeconds <= startSeconds) {
    throw new Error("End time must be greater than start time");
  }

  // Enforce minimum view range
  const MIN_RANGE_SECONDS = 0.1; // 100ms minimum range
  if (endSeconds - startSeconds < MIN_RANGE_SECONDS) {
    throw new Error(`View range must be at least ${MIN_RANGE_SECONDS}s`);
  }

  // Enforce maximum view range
  const MAX_RANGE_SECONDS = 3600; // 1 hour maximum range
  if (endSeconds - startSeconds > MAX_RANGE_SECONDS) {
    throw new Error(`View range cannot exceed ${MAX_RANGE_SECONDS}s`);
  }

  return {
    validatedStart: startSeconds,
    validatedEnd: endSeconds,
  };
};

export const validateViewRangeWithZoom = (
  startSeconds: Time,
  endSeconds: Time,
): void => {
  const state = useEngineStore.getState();
  const currentZoom = state.arrangement.viewState.zoom;

  // Calculate pixels per second at current zoom
  const PIXELS_PER_BEAT = 100 * currentZoom; // Example base value
  const currentTempo = state.transport.tempo;
  const pixelsPerSecond = (PIXELS_PER_BEAT * currentTempo) / 60;

  // Calculate view width in pixels
  const rangeSeconds =
    Tone.Time(endSeconds).toSeconds() - Tone.Time(startSeconds).toSeconds();
  const viewWidthPixels = rangeSeconds * pixelsPerSecond;

  // Check if view range is reasonable for current zoom
  const MIN_VIEW_WIDTH_PIXELS = 100;
  const MAX_VIEW_WIDTH_PIXELS = 50000; // Adjust based on performance requirements

  if (viewWidthPixels < MIN_VIEW_WIDTH_PIXELS) {
    throw new Error("View range too small for current zoom level");
  }

  if (viewWidthPixels > MAX_VIEW_WIDTH_PIXELS) {
    throw new Error("View range too large for current zoom level");
  }
};
