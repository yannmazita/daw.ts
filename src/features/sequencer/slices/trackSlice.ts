// src/features/sequencer/slices/trackSlice.ts

import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { SequencerStep, SequencerTrack, TrackState } from '@/core/interfaces/sequencer';
import { RootState } from '@/store';
import { Note } from '@/core/enums/note';
import { InstrumentName } from '@/core/enums';

const initialState: TrackState = {
  activeTrackId: null,
  tracks: [],
  steps: [],
};

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    initializeTracks: (state, action: PayloadAction<{ numTracks: number, numSteps: number }>) => {
      state.tracks = Array.from({ length: action.payload.numTracks }, (_, i) => ({
        id: i,
        muted: false,
        solo: false,
        effectiveMute: false,
        commonVelocity: null,
        commonNote: null,
        instrumentName: InstrumentName.Synth,
      }));
      state.steps = Array.from({ length: action.payload.numTracks * action.payload.numSteps }, (_, i) => ({
        id: `${Math.floor(i / action.payload.numSteps)}-${i % action.payload.numSteps}`,
        trackId: Math.floor(i / action.payload.numSteps),
        stepIndex: i % action.payload.numSteps,
        active: false,
        note: Note.C4,
        velocity: 100,
      }));
      if (state.tracks.length > 0) {
        state.activeTrackId = state.tracks[0].id;
      }
    },
    addTrack: (state, action: PayloadAction<{ position: number, numSteps: number }>) => {
      const newTrackId = state.tracks.length;
      state.tracks.splice(action.payload.position, 0, {
        id: newTrackId,
        muted: false,
        solo: false,
        effectiveMute: false,
        commonVelocity: null,
        commonNote: null,
        instrumentName: InstrumentName.Synth,
      });
      const newSteps = Array.from({ length: action.payload.numSteps }, (_, i) => ({
        id: `${newTrackId}-${i}`,
        trackId: newTrackId,
        stepIndex: i,
        active: false,
        note: Note.C4,
        velocity: 100,
      }));
      state.steps.push(...newSteps);
    },
    removeTrack: (state, action: PayloadAction<number>) => {
      state.tracks = state.tracks.filter(track => track.id !== action.payload);
      state.steps = state.steps.filter(step => step.trackId !== action.payload);
      if (state.activeTrackId === action.payload) {
        state.activeTrackId = state.tracks.length > 0 ? state.tracks[0].id : null;
      }
    },
    updateTrack: (state, action: PayloadAction<{ id: number } & Partial<SequencerTrack>>) => {
      const { id, ...changes } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...changes };
      }
    },
    updateStep: (state, action: PayloadAction<{ id: string } & Partial<SequencerStep>>) => {
      const { id, ...changes } = action.payload;
      const stepIndex = state.steps.findIndex(step => step.id === id);
      if (stepIndex !== -1) {
        state.steps[stepIndex] = { ...state.steps[stepIndex], ...changes };
      }
    },
    toggleTrackMuted: (state, action: PayloadAction<number>) => {
      const track = state.tracks.find(t => t.id === action.payload);
      if (track) {
        track.muted = !track.muted;
      }
    },
    toggleTrackSolo: (state, action: PayloadAction<number>) => {
      const track = state.tracks.find(t => t.id === action.payload);
      if (track) {
        track.solo = !track.solo;
      }
    },
    setActiveTrack: (state, action: PayloadAction<number>) => {
      state.activeTrackId = action.payload;
    },
  },
});

export const {
  initializeTracks,
  addTrack,
  removeTrack,
  updateTrack,
  updateStep,
  toggleTrackMuted,
  toggleTrackSolo,
  setActiveTrack,
} = trackSlice.actions;

// Selectors
export const selectAllTracks = (state: RootState) => state.track.tracks;
export const selectAllSteps = (state: RootState) => state.track.steps;
export const selectActiveTrackId = (state: RootState) => state.track.activeTrackId;

export const selectStepsByTrackId = createSelector(
  [selectAllSteps, (_, trackId: number) => trackId],
  (steps, trackId) => steps.filter(step => step.trackId === trackId)
);

export const selectActiveTrack = createSelector(
  [selectAllTracks, selectActiveTrackId],
  (tracks, activeTrackId) => tracks.find(track => track.id === activeTrackId) ?? null
);

export const selectEffectiveMutedTracks = createSelector(
  [selectAllTracks],
  (tracks) => {
    const soloTrackExists = tracks.some(track => track.solo);
    return tracks.map(track => ({
      ...track,
      effectiveMute: soloTrackExists ? !track.solo : track.muted
    }));
  }
);

export const selectTrackById = createSelector(
  [selectAllTracks, (_, trackId: number) => trackId],
  (tracks, trackId) => tracks.find(track => track.id === trackId)
);

export const selectStepById = createSelector(
  [selectAllSteps, (_, stepId: string) => stepId],
  (steps, stepId) => steps.find(step => step.id === stepId)
);

export const selectStepsByTrackIdAndStepIndices = createSelector(
  [selectAllSteps, (_, trackId: number, stepIndices: number[]) => ({ trackId, stepIndices })],
  (steps, { trackId, stepIndices }) => steps.filter(step => step.trackId === trackId && stepIndices.includes(step.stepIndex))
);

// Thunk
export const updateMultipleSteps = createAsyncThunk(
  'track/updateMultipleSteps',
  async (updates: (Partial<SequencerStep> & { id: string })[], { dispatch }) => {
    updates.forEach(update => {
      dispatch(updateStep(update));
    });
  }
);

export default trackSlice.reducer;
