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
  selectAllSteps,
  selectStepsByTrackId,
  selectActiveTrack,
  selectEffectiveMutedTracks,
} = fromTrack;

// Create combined selectors
export const selectCurrentStepData = createSelector(
  [selectCurrentStep, selectAllSteps],
  (currentStep, steps) => steps.filter(step => step.stepIndex === currentStep)
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
  [selectNumTracks, selectNumSteps, fromTrack.selectActiveTrackId],
  (numTracks, numSteps, activeTrackId) => ({
    numTracks,
    numSteps,
    activeTrackId,
  })
);

export const selectActiveStepsForCurrentStep = createSelector(
  [selectCurrentStep, selectAllSteps],
  (currentStep, steps) => steps.filter(step => step.stepIndex === currentStep && step.active)
);
