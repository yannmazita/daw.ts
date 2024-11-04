// src/features/sequencer/slices/trackSlice.ts

import { createSlice, PayloadAction, createSelector, Update } from '@reduxjs/toolkit';
import { SequencerTrack, SequencerStep } from '@/features/sequencer/models/SequencerModels';
import { TrackState } from '@/core/interfaces/sequencer';
import { RootState } from '@/store';

const initialState: TrackState = {
  activeTrackId: null,
  tracks: [],
};

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    initializeTracks: (state, action: PayloadAction<{ numTracks: number, numSteps: number }>) => {
      state.tracks = Array.from(
        { length: action.payload.numTracks },
        (_, i) => new SequencerTrack(i, action.payload.numSteps)
      );
      // Set the first track as active if there are tracks
      if (state.tracks.length > 0) {
        state.activeTrackId = state.tracks[0].id;
      }
    },
    addTrack: (state, action: PayloadAction<SequencerTrack>) => {
      state.tracks.push(action.payload);
    },
    removeTrack: (state, action: PayloadAction<number>) => {
      state.tracks = state.tracks.filter(track => track.id !== action.payload);
      // If the active track was removed, set the first remaining track as active
      if (state.activeTrackId === action.payload) {
        state.activeTrackId = state.tracks.length > 0 ? state.tracks[0].id : null;
      }
    },
    updateTrack: (state, action: PayloadAction<Update<SequencerTrack, number>>) => {
      const index = state.tracks.findIndex(track => track.id === action.payload.id);
      if (index !== -1) {
        state.tracks[index] = { ...state.tracks[index], ...action.payload.changes };
      }
    },
    updateStep: (state, action: PayloadAction<{ trackId: number, stepIndex: number, changes: Partial<SequencerStep> }>) => {
      const { trackId, stepIndex, changes } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track?.steps[stepIndex]) {
        Object.assign(track.steps[stepIndex], changes);
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
export const selectTrackById = (state: RootState, trackId: number) =>
  state.track.tracks.find(track => track.id === trackId);
export const selectActiveTrackId = (state: RootState) => state.track.activeTrackId;

// Custom selectors
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

export default trackSlice.reducer;
