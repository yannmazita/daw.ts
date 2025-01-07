// src/features/tracks/utils/audioUtils.ts
import { TrackState } from "../types.ts";

export const applyMuteStatesToNodes = (
  state: TrackState,
  muteStates: Record<string, boolean>,
): void => {
  Object.entries(muteStates).forEach(([id, mute]) => {
    const track = state.tracks[id];
    if (track) {
      track.channel.mute = mute;
    }
  });
};
