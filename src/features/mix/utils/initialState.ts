// src/features/mix/utils/intialState.ts
import { MixState } from "../types";

export const initialMixState: MixState = {
  mixer: {
    tracks: {},
    returnTracks: {},
    masterTrack: {},
    soloedElementsIds: {},
    tracksOrder: [],
    returnTracksOrder: [],
  },
};
