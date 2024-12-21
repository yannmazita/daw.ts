// src/features/arrangement/utils/automationUtils.ts
import { ArrangementState } from "../types";

export const getVisibleLanes = (
  trackId: string,
  state: ArrangementState,
): string[] => {
  return state.visibleAutomationLanes[trackId] || [];
};

export const toggleAutomationLane = (
  trackId: string,
  laneId: string,
  state: ArrangementState,
): Record<string, string[]> => {
  const currentLanes = getVisibleLanes(trackId, state);
  const isVisible = currentLanes.includes(laneId);

  return {
    ...state.visibleAutomationLanes,
    [trackId]: isVisible
      ? currentLanes.filter((id) => id !== laneId)
      : [...currentLanes, laneId],
  };
};

export const calculateAutomationHeight = (
  trackId: string,
  state: ArrangementState,
): number => {
  const visibleLanes = getVisibleLanes(trackId, state);
  return visibleLanes.length * state.viewSettings.defaultHeight;
};
