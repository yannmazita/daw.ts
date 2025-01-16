// src/features/clips/utils/playbackUtils.ts
import * as Tone from "tone";
import { ClipState, CompositionClip } from "../types";

export const startAudioPlayback = (
  state: ClipState,
  clip: CompositionClip,
  startTime?: number,
): ClipState => {
  const player = new Tone.Player(
    clip.data as Tone.ToneAudioBuffer,
  ).toDestination();
  player.start(startTime ?? clip.pausedAt);
  clip.node = player;
  clip.playerStartTime = startTime ?? clip.pausedAt; // Store the start time
  return state;
};
