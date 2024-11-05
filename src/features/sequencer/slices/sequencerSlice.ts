// src/features/sequencer/slices/sequencerSlice.ts

import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { initializeTracks } from './trackSlice';
import { SequenceStatus } from '@/core/enums/sequenceStatus';
import { StepPosition } from '@/core/interfaces/sequencer';
import { SequencerState } from '@/core/interfaces/sequencer';
import { RootState } from '@/store';

const initialState: SequencerState = {
  playback: {
    status: SequenceStatus.Stopped,
    bpm: 120,
    currentStep: 0,
    visualStep: 0,
    stepDuration: '16n',
    timeSignature: [4, 4],
  },
  structure: {
    numTracks: 4,
    numSteps: 16,
    rightClickSelectionPosition: { trackIndex: -1, stepIndex: -1 },
  },
};

const sequencerSlice = createSlice({
  name: 'sequencer',
  initialState,
  reducers: {
    setPlaybackStatus: (state, action: PayloadAction<SequenceStatus>) => {
      state.playback.status = action.payload;
    },
    setBpm: (state, action: PayloadAction<number>) => {
      if (action.payload > 0) {
        state.playback.bpm = action.payload;
      }
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.playback.currentStep = action.payload;
    },
    setVisualStep: (state, action: PayloadAction<number>) => {
      state.playback.visualStep = action.payload;
    },
    setStepDuration: (state, action: PayloadAction<string>) => {
      if (/^\d+n$/.test(action.payload)) {
        state.playback.stepDuration = action.payload;
      }
    },
    setTimeSignature: (state, action: PayloadAction<[number, number]>) => {
      const [numerator, denominator] = action.payload;
      if (numerator > 0 && denominator > 0) {
        state.playback.timeSignature = [numerator, denominator];
      }
    },
    setNumTracks: (state, action: PayloadAction<number>) => {
      if (action.payload > 0) {
        state.structure.numTracks = action.payload;
      }
    },
    setNumSteps: (state, action: PayloadAction<number>) => {
      if (action.payload >= 3) {
        state.structure.numSteps = action.payload;
      }
    },
    setRightClickSelectionPosition: (state, action: PayloadAction<StepPosition>) => {
      const { trackIndex, stepIndex } = action.payload;
      if (
        trackIndex >= -1 && trackIndex < state.structure.numTracks &&
        stepIndex >= -1 && stepIndex < state.structure.numSteps
      ) {
        state.structure.rightClickSelectionPosition = action.payload;
      }
    },
  },
});

export const {
  setPlaybackStatus,
  setBpm,
  setCurrentStep,
  setVisualStep,
  setStepDuration,
  setTimeSignature,
  setNumTracks,
  setNumSteps,
  setRightClickSelectionPosition,
} = sequencerSlice.actions;

export default sequencerSlice.reducer;

// Selectors
const selectSequencerState = (state: RootState) => state.sequencer;

export const selectPlaybackStatus = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.status
);

export const selectBpm = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.bpm
);

export const selectCurrentStep = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.currentStep
);

export const selectVisualStep = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.visualStep
);

export const selectStepDuration = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.stepDuration
);

export const selectTimeSignature = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.playback.timeSignature
);

export const selectNumTracks = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.structure.numTracks
);

export const selectNumSteps = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.structure.numSteps
);

export const selectRightClickSelectionPosition = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.structure.rightClickSelectionPosition
);

//Thunk
export const setNumTracksAndUpdateSteps = createAsyncThunk(
  'sequencer/setNumTracksAndUpdateSteps',
  async (numTracks: number, { dispatch, getState }) => {
    const state = getState() as RootState;
    const currentNumSteps = state.sequencer.structure.numSteps;

    dispatch(setNumTracks(numTracks));
    dispatch(initializeTracks({ numTracks, numSteps: currentNumSteps }));
  }
);

export const setNumStepsAndUpdateTracks = createAsyncThunk(
  'sequencer/setNumStepsAndUpdateTracks',
  async (numSteps: number, { dispatch, getState }) => {
    const state = getState() as RootState;
    const currentNumTracks = state.sequencer.structure.numTracks;

    dispatch(setNumSteps(numSteps));
    dispatch(initializeTracks({ numTracks: currentNumTracks, numSteps }));
  }
);
