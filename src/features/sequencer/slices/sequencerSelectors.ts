// src/features/sequencer/selectors/sequencerSelectors.ts

import { createSelector } from '@reduxjs/toolkit';
import * as fromSequencer from '../slices/sequencerSlice';
import * as fromTrack from '../slices/trackSlice';

// Re-export basic selectors
export const {
  selectPlaybackStatus,
  selectBpm,
  selectCurrentStep,
  selectVisualStep,
  selectStepDuration,
  selectTimeSignature,
  selectNumTracks,
  selectNumSteps,
  selectRightClickSelectionPosition,
} = fromSequencer;

export const {
  selectAllTracks,
  selectTrackById,
  selectTrackIds,
  selectActiveTrack,
  selectEffectiveMutedTracks,
} = fromTrack;

// Create combined selectors
export const selectCurrentStepData = createSelector(
  [selectCurrentStep, selectAllTracks],
  (currentStep, tracks) => tracks.map(track => ({
    trackId: track.id,
    stepData: track.steps[currentStep],
  }))
);

export const selectPlaybackWithTrackData = createSelector(
  [selectPlaybackStatus, selectBpm, selectCurrentStep, selectEffectiveMutedTracks],
  (status, bpm, currentStep, tracks) => ({
    status,
    bpm,
    currentStep,
    tracks: tracks.map(({ id, effectiveMute }) => ({ id, effectiveMute })),
  })
);

export const selectStructureWithActiveTrack = createSelector(
  [selectNumTracks, selectNumSteps, selectActiveTrack],
  (numTracks, numSteps, activeTrack) => ({
    numTracks,
    numSteps,
    activeTrackId: activeTrack?.id,
  })
);
