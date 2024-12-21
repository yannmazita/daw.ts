// src/features/arrangement/utils/intialState.ts
import { ArrangementState } from "../types";

export const initialViewSettings: ArrangementState["viewSettings"] = {
  trackHeights: {},
  defaultHeight: 100,
  minimumHeight: 60,
  foldedHeight: 20,
};

export const initialArrangementState: ArrangementState = {
  tracks: {},
  trackOrder: [],
  foldedTracks: new Set(),
  selectedTracks: new Set(),
  visibleAutomationLanes: {},
  dragState: null,
  viewSettings: initialViewSettings,
};
