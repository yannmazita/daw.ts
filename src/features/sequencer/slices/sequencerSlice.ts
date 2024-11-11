// src/features/sequencer/slices/sequencerSlice.ts

import * as Tone from 'tone';
import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { SequencerState, SequencerTrackInfo, SequencerStep } from '@/core/interfaces/sequencer';
import { RootState, AppDispatch } from '@/store';
import { InstrumentName, Note, SequenceStatus } from '@/core/enums';
import { Instrument } from '@/core/types';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';

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
      const { trackIndex, ...updates } = action.payload;
      const trackToUpdate = state.trackInfo.find(track => track.trackIndex === trackIndex);
      if (trackToUpdate) {
        Object.assign(trackToUpdate, updates);
        if (updates.timeSignature || updates.stepDuration) {
          trackToUpdate.stepsPerMeasure = calculateStepsPerMeasure(
            updates.timeSignature ?? trackToUpdate.timeSignature,
            updates.stepDuration ?? trackToUpdate.stepDuration
          );
          if (updates.loopStart !== undefined && updates.loopStart >= trackToUpdate.loopEnd) {
            trackToUpdate.loopEnd = updates.loopStart + 1;
          }
          if (updates.loopEnd !== undefined && updates.loopEnd <= trackToUpdate.loopStart) {
            trackToUpdate.loopStart = updates.loopEnd - 1;
          }
        }
      }
    },
    updateStepsForTrack: (state, action: PayloadAction<{ trackIndex: number, updatedSteps: SequencerStep[] }>) => {
      const { trackIndex, updatedSteps } = action.payload;

      // Remove existing steps for the track
      state.steps = state.steps.filter(step => step.trackIndex !== trackIndex);

      // Add the updated steps
      state.steps = [...state.steps, ...updatedSteps];

      console.log('Updated all steps:', state.steps);
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
      //state.steps = action.payload;
      state.steps = action.payload.map(step => ({ ...step }));
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
    toggleStep: (state, action: PayloadAction<{ trackIndex: number; stepIndex: number }>) => {
      const { trackIndex, stepIndex } = action.payload;
      const stepToToggle = state.steps.find(
        step => step.trackIndex === trackIndex && step.stepIndex === stepIndex
      );
      if (stepToToggle) {
        stepToToggle.active = !stepToToggle.active;
      }
    },
    initializeTracks: (state, action: PayloadAction<number>) => {
      const numTracks = action.payload;
      state.trackInfo = Array.from({ length: numTracks }, (_, index) => ({
        trackIndex: index,
        instrumentId: '',
        muted: false,
        solo: false,
        timeSignature: [4, 4],
        stepDuration: '4n',
        stepsPerMeasure: 16,
        bpm: state.globalBpm,
        commonVelocity: 100,
        commonNote: Note.C4,
        loopStart: 0,
        loopEnd: 15,
      }));

      // Initialize steps for each track
      state.steps = state.trackInfo.flatMap(track =>
        Array.from({ length: 16 }, (_, stepIndex) => ({
          trackIndex: track.trackIndex,
          stepIndex,
          active: false,
          note: track.commonNote ?? Note.C4,
          velocity: track.commonVelocity ?? 100,
          modulation: 0,
          pitchBend: 0,
        }))
      );
    },
  },
});

export const {
  setStatus,
  setGlobalBpm,
  addTrack,
  updateTrackInfo,
  updateStepsForTrack,
  setStep,
  setSteps,
  setCurrentStep,
  setTrackInstrument,
  toggleStep,
  initializeTracks,
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

export const selectAllSteps = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.steps
);

export const selectCurrentStep = createSelector(
  selectSequencerState,
  (sequencer) => sequencer.currentStep
);

export const selectMaxTrackLength = createSelector(
  selectSequencerState,
  (sequencer) => {
    const trackLengths = sequencer.trackInfo.map(track => {
      const steps = sequencer.steps.filter(step => step.trackIndex === track.trackIndex);
      return steps.length;
    });
    return Math.max(...trackLengths);
  }
);

export const selectStepsByTrack = (trackIndex: number) => createSelector(
  selectSequencerState,
  (sequencer) => sequencer.steps.filter(step => step.trackIndex === trackIndex)
);

// Utility function to calculate number of steps per measure based on time signature
const calculateStepsPerMeasure = (timeSignature: [number, number], stepDuration: string): number => {
  const [numerator, denominator] = timeSignature;
  const stepDurationMap: Record<string, number> = {
    '1n': 1,
    '2n': 2,
    '4n': 4,
    '8n': 8,
    '16n': 16,
    '32n': 32
  };
  return (numerator * stepDurationMap[stepDuration]) / (denominator / 4);
};

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
  void,
  Partial<SequencerTrackInfo> & { trackIndex: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'sequencer/updateTrackInfoAndSteps',
  async (trackInfoUpdate, { getState, dispatch }) => {
    dispatch(updateTrackInfo(trackInfoUpdate));

    const state = getState();
    const updatedTrackInfo = selectTrackInfo(state).find(t => t.trackIndex === trackInfoUpdate.trackIndex);

    if (!updatedTrackInfo) {
      throw new Error(`Track with index ${trackInfoUpdate.trackIndex} not found`);
    }

    if (trackInfoUpdate.timeSignature || trackInfoUpdate.stepDuration) {
      const newStepsPerMeasure = updatedTrackInfo.stepsPerMeasure;
      const currentSteps = selectStepsByTrack(trackInfoUpdate.trackIndex)(state);

      let updatedSteps: SequencerStep[] = [];

      if (currentSteps.length > newStepsPerMeasure) {
        // Remove excess steps
        updatedSteps = currentSteps.slice(0, newStepsPerMeasure);
      } else if (currentSteps.length < newStepsPerMeasure) {
        // Add new steps
        updatedSteps = [
          ...currentSteps,
          ...Array.from({ length: newStepsPerMeasure - currentSteps.length }, (_, index) => ({
            trackIndex: trackInfoUpdate.trackIndex,
            stepIndex: currentSteps.length + index,
            active: false,
            note: updatedTrackInfo.commonNote ?? Note.C4,
            velocity: updatedTrackInfo.commonVelocity ?? 100,
            modulation: 0,
            pitchBend: 0,
          })),
        ];
      } else {
        updatedSteps = currentSteps;
      }

      dispatch(updateStepsForTrack({ trackIndex: trackInfoUpdate.trackIndex, updatedSteps }));
    }
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

export const initializeSequencer = createAsyncThunk<
  void,
  number,
  { state: RootState; dispatch: AppDispatch }
>(
  'sequencer/initializeSequencer',
  async (numTracks, { dispatch }) => {
    dispatch(initializeTracks(numTracks));

    // Assign default instruments to tracks
    for (let i = 0; i < numTracks; i++) {
      const instrumentId = `instrument_${i}_${Date.now()}`;
      const defaultInstrument = new Tone.Synth().toDestination();
      instrumentManager.addInstrument(instrumentId, defaultInstrument);
      dispatch(setTrackInstrument({
        trackIndex: i,
        instrumentId,
        instrumentName: InstrumentName.Synth
      }));
    }
  }
);
