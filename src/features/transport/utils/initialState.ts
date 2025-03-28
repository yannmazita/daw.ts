// src/features/transport/utils/intialState.ts
import { TransportState } from "../types";

export const initialTransportState: TransportState = {
  isPlaying: false,
  isRecording: false,
  tempo: 120,
  timeSignature: [4, 4],
  tapTimes: [],
  loop: {
    enabled: false,
    start: 0,
    end: 0,
  },
  duration: 0,
  position: 0,
};
