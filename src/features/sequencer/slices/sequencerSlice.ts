// src/features/sequencer/slices/sequencerSlice.ts

import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { SequencerState, SequencerTrackInfo, SequencerStep } from '@/core/interfaces/sequencer';
import { RootState, AppDispatch } from '@/store';
import { InstrumentName, Note, SequenceStatus } from '@/core/enums';
import { Instrument } from '@/core/types';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';

interface UpdateTrackResult {
  updatedTrackInfo: SequencerTrackInfo;
  updatedSteps: SequencerStep[];
}

const initialState: SequencerState = {
  status: SequenceStatus.Stopped,
  steps: [],
  trackInfo: [],
  globalBpm: 120,
  currentStep: 0,
};

const sequencerSlice = createSlice({
  name: 'sequencer',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SequenceStatus>) => {
      state.status = action.payload;
    },
    setGlobalBpm: (state, action: PayloadAction<number>) => {
      state.globalBpm = action.payload;
    },
    addTrack: (state, action: PayloadAction<SequencerTrackInfo>) => {
      state.trackInfo.push(action.payload);
    },
    updateTrackInfo: (state, action: PayloadAction<Partial<SequencerTrackInfo> & { trackIndex: number }>) => {
      const trackIndex = state.trackInfo.findIndex(track => track.trackIndex === action.payload.trackIndex);
      if (trackIndex !== -1) {
        state.trackInfo[trackIndex] = { ...state.trackInfo[trackIndex], ...action.payload };
      }
    },
    setStep: (state, action: PayloadAction<SequencerStep>) => {
      const { trackIndex, stepIndex } = action.payload;
      const index = state.steps.findIndex(
        step => step.trackIndex === trackIndex && step.stepIndex === stepIndex
      );
      if (index !== -1) {
        state.steps[index] = action.payload;
      } else {
        state.steps.push(action.payload);
      }
    },
    setSteps: (state, action: PayloadAction<SequencerStep[]>) => {
      state.steps = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setTrackInstrument: (state, action: PayloadAction<{ trackIndex: number; instrumentId: string; instrumentName: InstrumentName }>) => {
      const track = state.trackInfo.find(t => t.trackIndex === action.payload.trackIndex);
      if (track) {
        track.instrumentId = action.payload.instrumentId;
        //track.instrumentName = action.payload.instrumentName;
      }
    },
  },
});

export const {
  setStatus,
  setGlobalBpm,
  addTrack,
  updateTrackInfo,
  setStep,
  setSteps,
  setCurrentStep,
  setTrackInstrument,
} = sequencerSlice.actions;

export default sequencerSlice.reducer;

// Selectors
const selectSequencerState = (state: RootState) => state.sequencer;

export const selectStatus = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.status
);

export const selectGlobalBpm = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.globalBpm
);

export const selectTrackInfo = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.trackInfo
);

export const selectSteps = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.steps
);

export const selectCurrentStep = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.currentStep
);

// Utility function to calculate number of steps based on time signature and step duration
export const calculateSteps = (timeSignature: [number, number], stepDuration: string): number => {
  const [numerator, denominator] = timeSignature;
  const stepDurationMap: Record<string, number> = {
    '4n': 1,
    '8n': 2,
    '16n': 4,
    '32n': 8,
  };
  return numerator * stepDurationMap[stepDuration];
};

// Thunk to update track info and recalculate steps
export const updateTrackInfoAndSteps = createAsyncThunk<
  UpdateTrackResult,
  Partial<SequencerTrackInfo> & { trackIndex: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'sequencer/updateTrackInfoAndSteps',
  async (trackInfo, { getState, dispatch }) => {
    dispatch(updateTrackInfo(trackInfo));

    const state = getState();
    const updatedTrackInfo = selectTrackInfo(state).find(t => t.trackIndex === trackInfo.trackIndex);

    if (!updatedTrackInfo) {
      throw new Error(`Track with index ${trackInfo.trackIndex} not found`);
    }

    let updatedSteps: SequencerStep[] = [];

    if (trackInfo.timeSignature || trackInfo.stepDuration) {
      const newStepCount = calculateSteps(
        trackInfo.timeSignature ?? updatedTrackInfo.timeSignature,
        trackInfo.stepDuration ?? updatedTrackInfo.stepDuration
      );

      // Update steps for this track
      const currentSteps = selectSteps(state).filter(s => s.trackIndex === trackInfo.trackIndex);
      if (currentSteps.length > newStepCount) {
        // Remove excess steps
        updatedSteps = currentSteps.slice(0, newStepCount);
      } else if (currentSteps.length < newStepCount) {
        // Add new steps
        const newSteps = Array.from({ length: newStepCount - currentSteps.length }, (_, i) => ({
          trackIndex: trackInfo.trackIndex,
          stepIndex: currentSteps.length + i,
          active: false,
          note: updatedTrackInfo.commonNote ?? Note.C4,
          velocity: updatedTrackInfo.commonVelocity ?? 100,
        }));
        updatedSteps = [...currentSteps, ...newSteps];
      } else {
        updatedSteps = currentSteps;
      }

      dispatch(setSteps(updatedSteps));
    } else {
      updatedSteps = selectSteps(state).filter(s => s.trackIndex === trackInfo.trackIndex);
    }

    return {
      updatedTrackInfo,
      updatedSteps,
    };
  }
);

export const setTrackInstrumentThunk = createAsyncThunk<
  void,
  { trackIndex: number; instrument: Instrument },
  { state: RootState; dispatch: AppDispatch }
>(
  'sequencer/setTrackInstrumentThunk',
  async ({ trackIndex, instrument }, { dispatch }) => {
    const instrumentId = `instrument_${trackIndex}_${Date.now()}`;
    instrumentManager.addInstrument(instrumentId, instrument);
    dispatch(setTrackInstrument({ trackIndex, instrumentId, instrumentName: InstrumentName[instrument.name as keyof typeof InstrumentName] }));
  }
);
