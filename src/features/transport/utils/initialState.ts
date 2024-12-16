// src/features/transport/utils/intialState.ts
import { TransportState } from "../types";

export const initialTransportState: TransportState = {
  isPlaying: false,
  isRecording: false,
  currentTime: 0,
  tempo: 120,
  timeSignature: [4, 4],
  loop: {
    enabled: false,
    start: 0,
    end: 0,
  },
  swing: 0,
  swingSubdivision: "8n",
};
