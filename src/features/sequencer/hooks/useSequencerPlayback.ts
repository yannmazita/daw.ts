// src/features/sequencer/hooks/useSequencerPlayback.ts

import { useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Tone from 'tone';
import {
  selectPlaybackStatus,
  selectBpm,
  selectCurrentStep,
  selectVisualStep,
  selectStepDuration,
  selectTimeSignature,
  selectNumSteps,
  setPlaybackStatus,
  setBpm,
  setCurrentStep,
  setVisualStep,
  setStepDuration,
  setTimeSignature
} from '../slices/sequencerSlice';
import { selectAllTracks } from '../slices/trackSlice';
import { SequenceStatus } from '@/core/enums/sequenceStatus';
import { useSequencerInstruments } from './useSequencerInstruments';
import { useSequencerTracks } from './useSequencerTracks';

export const useSequencerPlayback = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectPlaybackStatus);
  const bpm = useSelector(selectBpm);
  const currentStep = useSelector(selectCurrentStep);
  const visualStep = useSelector(selectVisualStep);
  const stepDuration = useSelector(selectStepDuration);
  const timeSignature = useSelector(selectTimeSignature);
  const numSteps = useSelector(selectNumSteps);
  const tracks = useSelector(selectAllTracks);

  const { getTrackInstrument } = useSequencerInstruments();
  const {
    getStepActive,
    getTrackEffectiveMute,
    getTrackVelocity,
    getStepVelocity,
    getTrackNote,
    getStepNote
  } = useSequencerTracks();

  const playbackStartTimeRef = useRef<number | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  const clearScheduledEvents = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
  }, []);

  const resetPlaybackPosition = useCallback(() => {
    dispatch(setCurrentStep(0));
    dispatch(setVisualStep(0));
  }, [dispatch]);

  const calculateCurrentStep = useCallback((time: number): number => {
    const elapsedTime = time - (playbackStartTimeRef.current ?? 0);
    const stepsElapsed = Math.floor(elapsedTime / Tone.Time(stepDuration).toSeconds());
    return stepsElapsed % numSteps;
  }, [stepDuration, numSteps]);

  const playCurrentStep = useCallback((stepIndex: number, time: number) => {
    tracks.forEach((track, trackIndex) => {
      if (getStepActive(trackIndex, stepIndex) && !getTrackEffectiveMute(trackIndex)) {
        const instrument = getTrackInstrument(trackIndex);
        if (!instrument) return;

        const velocity = getTrackVelocity(trackIndex) ?? getStepVelocity(trackIndex, stepIndex);
        const note = getTrackNote(trackIndex) ?? getStepNote(trackIndex, stepIndex);

        if (instrument instanceof Tone.NoiseSynth) {
          instrument.triggerAttackRelease(stepDuration, time, velocity);
        } else {
          instrument.triggerAttackRelease(note, stepDuration, time, velocity);
        }
      }
    });
  }, [tracks, getStepActive, getTrackEffectiveMute, getTrackInstrument, getTrackVelocity, getStepVelocity, getTrackNote, getStepNote, stepDuration]);

  const updateVisualStep = useCallback((stepIndex: number) => {
    dispatch(setCurrentStep(stepIndex));
    dispatch(setVisualStep(stepIndex));
  }, [dispatch]);

  const handleLooping = useCallback((currentStepIndex: number) => {
    if (currentStepIndex >= numSteps - 1) {
      playbackStartTimeRef.current = Tone.now();
    }
  }, [numSteps]);

  const scheduleSequence = useCallback(() => {
    clearScheduledEvents();

    loopRef.current = new Tone.Loop((time) => {
      const currentStepIndex = calculateCurrentStep(time);
      playCurrentStep(currentStepIndex, time);
      updateVisualStep(currentStepIndex);
      handleLooping(currentStepIndex);
    }, stepDuration).start(0);
  }, [clearScheduledEvents, calculateCurrentStep, playCurrentStep, updateVisualStep, handleLooping, stepDuration]);

  const playSequence = useCallback(() => {
    if (status === SequenceStatus.Playing) return;

    if (status === SequenceStatus.Paused) {
      dispatch(setPlaybackStatus(SequenceStatus.Playing));
      Tone.getTransport().start();
      return;
    }

    dispatch(setPlaybackStatus(SequenceStatus.Scheduled));

    Tone.getTransport().scheduleOnce(() => {
      playbackStartTimeRef.current = Tone.now();
      scheduleSequence();
      dispatch(setPlaybackStatus(SequenceStatus.Playing));
    }, stepDuration);

    Tone.getTransport().start();
  }, [status, dispatch, scheduleSequence, stepDuration]);

  const pauseSequence = useCallback(() => {
    if (status !== SequenceStatus.Playing) return;

    dispatch(setPlaybackStatus(SequenceStatus.Paused));
    Tone.getTransport().pause();
  }, [status, dispatch]);

  const stopSequence = useCallback(() => {
    dispatch(setPlaybackStatus(SequenceStatus.Stopped));
    Tone.getTransport().stop();
    clearScheduledEvents();
    resetPlaybackPosition();
  }, [dispatch, clearScheduledEvents, resetPlaybackPosition]);

  const setStepDurationValue = useCallback((duration: string) => {
    dispatch(setStepDuration(duration));
    if (status === SequenceStatus.Playing) {
      stopSequence();
      playSequence();
    }
  }, [dispatch, status, stopSequence, playSequence]);

  const seekTo = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= numSteps) {
      console.warn(`Invalid step index: ${stepIndex}. Must be between 0 and ${numSteps - 1}.`);
      return;
    }
    dispatch(setCurrentStep(stepIndex));
    dispatch(setVisualStep(stepIndex));
    if (status === SequenceStatus.Playing) {
      playbackStartTimeRef.current = Tone.now() - (Tone.Time(stepDuration).toSeconds() * stepIndex);
    }
  }, [dispatch, status, numSteps, stepDuration]);

  const setBpmValue = useCallback((newBpm: number) => {
    if (newBpm <= 0) {
      console.warn(`Invalid BPM value: ${newBpm}. Must be greater than 0.`);
      return;
    }
    dispatch(setBpm(newBpm));
    Tone.getTransport().bpm.value = newBpm;
  }, [dispatch]);

  const setTimeSignatureValue = useCallback((numerator: number, denominator: number) => {
    if (numerator <= 0 || denominator <= 0) {
      console.warn(`Invalid time signature: ${numerator}/${denominator}. Both values must be greater than 0.`);
      return;
    }
    dispatch(setTimeSignature([numerator, denominator]));
    Tone.getTransport().timeSignature = [numerator, denominator];
  }, [dispatch]);

  useEffect(() => {
    return () => {
      clearScheduledEvents();
    };
  }, [clearScheduledEvents]);

  return {
    playSequence,
    pauseSequence,
    stopSequence,
    setStepDurationValue,
    seekTo,
    setBpmValue,
    setTimeSignatureValue,
    status,
    bpm,
    currentStep,
    visualStep,
    stepDuration,
    timeSignature,
  };
};
