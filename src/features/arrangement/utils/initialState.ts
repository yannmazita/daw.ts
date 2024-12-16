// src/features/arrangement/utils/intialState.ts
import { ArrangementState } from "../types";

export const initialArrangementState: ArrangementState = {
  tracks: {},
  returnTracks: [],
  masterTrackId: "",
  trackOrder: [],
  clips: {},
  clipContents: {},
  selection: {
    trackIds: [],
    clipIds: [],
    automationPoints: [],
  },
  viewState: {
    startTime: 0,
    endTime: 0,
    verticalScroll: 0,
    zoom: 0,
  },
};
