// src/features/mix/utils/intialState.ts
import { MixerTrackControlState, MixState } from "../types";

export const initialMixerTrackControlState: MixerTrackControlState = {
  solo: false,
  mute: false,
  pan: 0,
  volume: 0,
};

export const initialMixState: MixState = {
  mixerTracks: {},
  mixerTrackOrder: ["master"],
  devices: {},
  sends: {},
  trackSends: {},
};
