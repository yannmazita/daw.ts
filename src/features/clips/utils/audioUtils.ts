// src/features/clips/utils/audioUtils.ts
import * as Tone from "tone";
import { Time, Decibels } from "tone/build/esm/core/type/Units";

export const updatePlayerVolume = (
  player: Tone.Player,
  gain: Decibels,
  rampTime: Time = 0.05,
): void => {
  if (!Number.isFinite(gain)) {
    throw new Error("Invalid gain value");
  }
  const now = Tone.now();
  player.volume.cancelScheduledValues(now);
  player.volume.rampTo(gain, rampTime);
};

export const updatePlayerFades = (
  player: Tone.Player,
  fadeIn: Time,
  fadeOut: Time,
): void => {
  try {
    const fadeInSeconds = Tone.Time(fadeIn).toSeconds();
    const fadeOutSeconds = Tone.Time(fadeOut).toSeconds();

    // Store current playback state
    const wasPlaying = player.state === "started";
    const currentTime = Tone.getTransport().seconds;

    // Apply new fade settings
    player.fadeIn = fadeInSeconds;
    player.fadeOut = fadeOutSeconds;

    // Restore playback state if needed
    if (wasPlaying) {
      player.stop();
      player.start(currentTime); // Resume from transport time
    }
  } catch (error) {
    console.warn("Error updating player fades:", error);
    throw error;
  }
};

export const startPlayer = (player: Tone.Player, startTime?: Time): void => {
  if (startTime !== undefined) {
    player.start(startTime);
  } else {
    player.start();
  }
};

export const stopPlayer = (player: Tone.Player): void => {
  player.stop();
};

export const disposePlayer = (player: Tone.Player): void => {
  if (player.state === "started") {
    player.stop();
  }
  player.dispose();
};

export const startAudioClip = (player: Tone.Player, startTime?: Time): void => {
  try {
    // Ensure audio context is running
    if (Tone.getContext().state !== "running") {
      throw new Error("Audio context is not running");
    }

    // Handle different start time scenarios
    if (startTime !== undefined) {
      player.start(startTime);
    } else {
      player.start();
    }
  } catch (error) {
    console.warn("Error starting audio clip:", error);
    throw error;
  }
};

export const stopAudioClip = (player: Tone.Player): void => {
  try {
    player.stop();
  } catch (error) {
    console.warn("Error stopping audio clip:", error);
    throw error;
  }
};
