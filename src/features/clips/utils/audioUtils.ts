// src/features/clips/utils/audioUtils.ts
import * as Tone from "tone";
import { ClipLoop } from "../types";
import { Time, Decibels } from "tone/build/esm/core/type/Units";

export const createAudioPlayer = (
  buffer: Tone.ToneAudioBuffer,
  loop?: ClipLoop,
  gain: Decibels = 0,
): Tone.Player => {
  const player = new Tone.Player({
    url: buffer,
    loop: loop?.enabled ?? false,
    loopStart: loop?.start ?? 0,
    loopEnd: loop?.enabled
      ? Tone.Time(loop.start).toSeconds() + Tone.Time(loop.duration).toSeconds()
      : undefined,
    volume: gain,
  }).toDestination();

  return player;
};

export const updatePlayerVolume = (
  player: Tone.Player,
  gain: Decibels,
  rampTime: Time = 0.05,
): void => {
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

export const getPlayerPosition = (clipStartTime: Time): Time => {
  const transportTime = Tone.getTransport().seconds;
  const clipStartSeconds = Tone.Time(clipStartTime).toSeconds();
  return Math.max(0, transportTime - clipStartSeconds);
};

export const isPlayerPlaying = (player: Tone.Player): boolean => {
  return player.state === "started";
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
