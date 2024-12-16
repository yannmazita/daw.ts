// src/features/clips/utils/intialState.ts
import { ClipState } from "../types";

export const initialClipState: ClipState = {
  contents: {},
  activeClips: {},
  isRecording: false,
  recordingTake: {
    trackId: "",
    startTime: 0,
    type: "midi",
  },
};
