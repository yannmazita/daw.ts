// src/features/composition/utils/intialState.ts
import { CompositionState, TrackControlState } from "../types";

export const initialTrackControlState: TrackControlState = {
  solo: false,
  mute: false,
  armed: false,
  pan: 0,
  volume: 0,
  peakLevel: [-Infinity, -Infinity],
  clipWarning: false,
  lastClipTime: null,
};

export const initialCompositionState: CompositionState = {
  tracks: {},
  trackOrder: [],
};
