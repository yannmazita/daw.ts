// src/features/mix/utils/validationUtils.ts
import { Track } from "@/features/composition/types";
import { MixerTrack, Send } from "../types";

export interface SendValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSendUpdate = (
  send: Send,
  sourceTrack: Track,
  mixerTracks: Record<string, MixerTrack>,
  updates: Partial<Send>,
): SendValidationResult => {
  if (send.sourceTrackId !== sourceTrack.id) {
    return {
      isValid: false,
      error: "Send doesn't belong to specified track",
    };
  }

  if (updates.returnTrackId) {
    const targetTrack = mixerTracks[updates.returnTrackId];
    if (!targetTrack) {
      return {
        isValid: false,
        error: `Target return track ${updates.returnTrackId} not found`,
      };
    }
    if (targetTrack.type !== "return" && targetTrack.type !== "master") {
      return {
        isValid: false,
        error: `Track ${updates.returnTrackId} is not a return track or master track`,
      };
    }
  }

  return { isValid: true };
};

export const validateSendRouting = (
  fromId: string,
  toId: string,
  compositionTracks: Record<string, Track>,
  mixerTracks: Record<string, MixerTrack>,
  sends: Record<string, Send>,
  trackSends: Record<string, string[]>,
): SendValidationResult => {
  const targetTrack = mixerTracks[toId];
  const sourceTrack = compositionTracks[fromId];

  // Check tracks exist
  if (!sourceTrack) {
    return { isValid: false, error: `Source track ${fromId} not found` };
  }
  if (!targetTrack) {
    return { isValid: false, error: `Target track ${toId} not found` };
  }

  // Can only send to return tracks or master track
  if (targetTrack.type !== "return" && targetTrack.type !== "master") {
    return {
      isValid: false,
      error: "Can only send to return track or master track",
    };
  }

  // Source track cannot send to itself
  if (fromId === toId) {
    return {
      isValid: false,
      error: "Track cannot send to itself",
    };
  }

  // Check for existing sends from this track
  let existingSendIds: string[] = [];
  try {
    existingSendIds = trackSends[fromId];
  } catch (error) {
    console.warn("Failed to get existing sends:", error);
    existingSendIds = [];
  }
  const existingSends = existingSendIds.map((id) => sends[id]);

  // Prevent duplicate sends to same return track
  if (existingSends.some((send) => send.returnTrackId === toId)) {
    return {
      isValid: false,
      error: `Send already exists from ${fromId} to ${toId}`,
    };
  }

  return { isValid: true };
};
