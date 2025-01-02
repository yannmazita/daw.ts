// src/features/composition/utils/stateUtils.ts

import { Track, CompositionState } from "../types";

interface SoloStateUpdate {
  trackId: string;
  solo: boolean;
  muteStates: Record<string, boolean>;
}

/**
 * Calculates new mute states for all tracks based on solo changes.
 *
 * @param trackId - ID of the track being changed
 * @param solo - New solo state
 * @param tracks - Current track state
 * @returns Object containing track ID, solo state, and new mute states
 */
export const calculateSoloState = (
  trackId: string,
  solo: boolean,
  tracks: Record<string, Track>,
): SoloStateUpdate => {
  const muteStates: Record<string, boolean> = {};

  if (solo) {
    // When soloing a track
    Object.entries(tracks).forEach(([id, track]) => {
      muteStates[id] = id !== trackId && !track.controls.solo;
    });
  } else {
    // When un-soloing a track
    const otherSoloedTracks = Object.values(tracks).some(
      (t) => t.id !== trackId && t.controls.solo,
    );

    if (otherSoloedTracks) {
      // If other tracks are still soloed
      Object.entries(tracks).forEach(([id, track]) => {
        muteStates[id] = !track.controls.solo;
      });
    } else {
      // If no tracks are soloed anymore, unmute all tracks
      Object.entries(tracks).forEach(([id, _]) => {
        muteStates[id] = false; // Unmute all tracks
      });
    }
  }

  return {
    trackId,
    solo,
    muteStates,
  };
};

/**
 * Updates track states with new solo and mute values
 */
export const updateTrackSoloStates = (
  state: CompositionState,
  soloUpdate: SoloStateUpdate,
): CompositionState => {
  const newTracks = { ...state.tracks };

  // Update the soloed track
  newTracks[soloUpdate.trackId] = {
    ...newTracks[soloUpdate.trackId],
    controls: {
      ...newTracks[soloUpdate.trackId].controls,
      solo: soloUpdate.solo,
    },
  };

  // Update mute states for all tracks
  Object.entries(soloUpdate.muteStates).forEach(([id, mute]) => {
    if (newTracks[id]) {
      newTracks[id] = {
        ...newTracks[id],
        controls: {
          ...newTracks[id].controls,
          mute,
        },
      };
    }
  });

  return {
    ...state,
    tracks: newTracks,
  };
};
