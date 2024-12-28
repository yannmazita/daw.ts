// src/features/mix/utils/validationUtils.ts
import { MixerTrack, Send } from "../types";

export interface SendValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSendUpdate = (
  send: Send,
  sourceTrack: MixerTrack,
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
    if (targetTrack.type !== "return") {
      return {
        isValid: false,
        error: `Track ${updates.returnTrackId} is not a return track`,
      };
    }
  }

  return { isValid: true };
};

export const validateSendRouting = (
  fromId: string,
  toId: string,
  mixerTracks: Record<string, MixerTrack>,
  sends: Record<string, Send>,
  trackSends: Record<string, string[]>,
): SendValidationResult => {
  const targetTrack = mixerTracks[toId];
  const sourceTrack = mixerTracks[fromId];

  // Check tracks exist
  if (!sourceTrack) {
    return { isValid: false, error: `Source track ${fromId} not found` };
  }
  if (!targetTrack) {
    return { isValid: false, error: `Target track ${toId} not found` };
  }

  // Can only send to return tracks
  if (targetTrack.type !== "return") {
    return {
      isValid: false,
      error: `Cannot send to non-return track ${toId}`,
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
  const existingSendIds = trackSends[fromId] || [];
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
