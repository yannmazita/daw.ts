// src/features/arrangement/utils/stateUtils.ts

import { Track, ArrangementState } from "../types";

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
      if (id === trackId) {
        // Never mute the track being soloed
        muteStates[id] = false;
      } else if (track.controls.solo) {
        // Keep other soloed tracks unmuted
        muteStates[id] = false;
      } else {
        // Mute all non-soloed tracks
        muteStates[id] = true;
      }
    });
  } else {
    // When un-soloing a track
    const otherSoloedTracks = Object.values(tracks).some(
      (t) => t.id !== trackId && t.controls.solo,
    );

    if (otherSoloedTracks) {
      // If other tracks are still soloed
      Object.entries(tracks).forEach(([id, track]) => {
        if (id === trackId) {
          // Mute this track as it's no longer soloed
          muteStates[id] = true;
        } else {
          // Keep other tracks' states based on their solo status
          muteStates[id] = !track.controls.solo;
        }
      });
    } else {
      // If no tracks are soloed anymore, restore original mute states
      Object.entries(tracks).forEach(([id, track]) => {
        muteStates[id] = track.controls.mute;
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
  state: ArrangementState,
  soloUpdate: SoloStateUpdate,
): ArrangementState => {
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
