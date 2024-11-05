// src/features/sequencer/hooks/useSequencerTracks.ts

import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllTracks,
  selectEffectiveMutedTracks,
  updateTrack,
  updateStep,
  toggleTrackMuted,
  toggleTrackSolo,
  setActiveTrack,
  addTrack,
  removeTrack,
} from '../slices/trackSlice';
import { setNumTracks, setNumSteps, selectNumSteps } from '../slices/sequencerSlice';
import { Note } from '@/core/enums/note';
import { SequencerStep, SequencerTrack } from '@/core/interfaces/sequencer';

export const useSequencerTracks = () => {
  const dispatch = useDispatch();
  const tracks = useSelector(selectAllTracks);
  const effectiveMutedTracks = useSelector(selectEffectiveMutedTracks);
  const numSteps = useSelector(selectNumSteps);

  const addNewTrack = useCallback((insertPosition: number = tracks.length) => {
    if (insertPosition < 0 || insertPosition > tracks.length) {
      console.warn(`Invalid insert position: ${insertPosition}. Using default position at the end.`);
      insertPosition = tracks.length;
    }
    dispatch(addTrack({ position: insertPosition, numSteps }));
    dispatch(setNumTracks(tracks.length + 1));
  }, [tracks.length, numSteps, dispatch]);

  const removeTrackAt = useCallback((deletePosition: number) => {
    if (deletePosition < 0 || deletePosition >= tracks.length) {
      console.warn(`Invalid delete position: ${deletePosition}. No track removed.`);
      return;
    }
    dispatch(removeTrack(deletePosition));
    dispatch(setNumTracks(tracks.length - 1));
  }, [tracks.length, dispatch]);

  const updateTrackData = useCallback((trackId: number, changes: Partial<SequencerTrack>) => {
    dispatch(updateTrack({ id: trackId, ...changes }));
  }, [dispatch]);

  const updateStepData = useCallback((stepId: string, changes: Partial<SequencerStep>) => {
    dispatch(updateStep({ id: stepId, ...changes }));
  }, [dispatch]);

  const toggleMute = useCallback((trackId: number) => {
    dispatch(toggleTrackMuted(trackId));
  }, [dispatch]);

  const toggleSolo = useCallback((trackId: number) => {
    dispatch(toggleTrackSolo(trackId));
  }, [dispatch]);

  const setActiveTrackId = useCallback((trackId: number) => {
    if (trackId < 0 || trackId >= tracks.length) {
      console.warn(`Invalid track ID: ${trackId}. Active track not set.`);
      return;
    }
    dispatch(setActiveTrack(trackId));
  }, [tracks.length, dispatch]);

  const setTrackCount = useCallback((newCount: number) => {
    if (newCount < 1) {
      console.warn(`Invalid track count: ${newCount}. Must be at least 1.`);
      return;
    }
    dispatch(setNumTracks(newCount));
  }, [dispatch]);

  const setStepCount = useCallback((newCount: number) => {
    if (newCount < 1) {
      console.warn(`Invalid step count: ${newCount}. Must be at least 1.`);
      return;
    }
    dispatch(setNumSteps(newCount));
  }, [dispatch]);

  const getTrackMuted = useCallback((trackIndex: number): boolean => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return false;
    }
    return tracks[trackIndex].muted;
  }, [tracks]);

  const getTrackSolo = useCallback((trackIndex: number): boolean => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return false;
    }
    return tracks[trackIndex].solo;
  }, [tracks]);

  const getStepActive = useCallback((trackIndex: number, stepIndex: number): boolean => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return false;
    }
    if (stepIndex < 0 || stepIndex >= numSteps) {
      console.warn(`Invalid step index: ${stepIndex}`);
      return false;
    }
    return tracks[trackIndex].steps[stepIndex].active;
  }, [tracks, numSteps]);

  const getStepVelocity = useCallback((trackIndex: number, stepIndex: number): number => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return 100;
    }
    if (stepIndex < 0 || stepIndex >= numSteps) {
      console.warn(`Invalid step index: ${stepIndex}`);
      return 100;
    }
    return tracks[trackIndex].steps[stepIndex].velocity;
  }, [tracks, numSteps]);

  const getStepNote = useCallback((trackIndex: number, stepIndex: number): Note => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return Note.C4;
    }
    if (stepIndex < 0 || stepIndex >= numSteps) {
      console.warn(`Invalid step index: ${stepIndex}`);
      return Note.C4;
    }
    return tracks[trackIndex].steps[stepIndex].note;
  }, [tracks, numSteps]);

  const getTrackVelocity = useCallback((trackIndex: number): number | null => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return null;
    }
    return tracks[trackIndex].commonVelocity;
  }, [tracks]);

  const getTrackNote = useCallback((trackIndex: number): Note | null => {
    if (trackIndex < 0 || trackIndex >= tracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return null;
    }
    return tracks[trackIndex].commonNote;
  }, [tracks]);

  const getTrackEffectiveMute = useCallback((trackIndex: number): boolean => {
    if (trackIndex < 0 || trackIndex >= effectiveMutedTracks.length) {
      console.warn(`Invalid track index: ${trackIndex}`);
      return true;
    }
    return effectiveMutedTracks[trackIndex].effectiveMute;
  }, [effectiveMutedTracks]);

  const trackData = useMemo(() => ({
    tracks,
    effectiveMutedTracks,
    numTracks: tracks.length,
    numSteps,
  }), [tracks, effectiveMutedTracks, numSteps]);

  return {
    addNewTrack,
    removeTrackAt,
    updateTrackData,
    updateStepData,
    toggleMute,
    toggleSolo,
    setActiveTrackId,
    setTrackCount,
    setStepCount,
    getTrackMuted,
    getTrackSolo,
    getStepActive,
    getStepVelocity,
    getStepNote,
    getTrackVelocity,
    getTrackNote,
    getTrackEffectiveMute,
    trackData,
  };
};
