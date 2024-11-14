// src/features/sequencer/hooks/useSequencerPlayback.ts

import * as Tone from 'tone';
import { useSequencerStore } from '../slices/useSequencerStore';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';
import { SequenceStatus } from '@/core/enums/sequenceStatus';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useSequencerPlayback = () => {
  const status = useSequencerStore(state => state.status);
  const setStatus = useSequencerStore(state => state.setStatus);
  const steps = useSequencerStore(state => state.steps);
  const allTrackInfo = useSequencerStore(state => state.trackInfo);
  const globalBpm = useSequencerStore(state => state.globalBpm);
  const setCurrentStep = useSequencerStore(state => state.setCurrentStep);

  const loopRef = useRef<Tone.Loop | null>(null);
  const stepCounterRef = useRef<number>(0);
  const [loopEnabled, setLoopEnabled] = useState(true);

  const getStepDurationInSeconds = useCallback((trackIndex: number): number => {
    const track = allTrackInfo[trackIndex];
    const { timeSignature: [numerator, denominator], stepsPerMeasure } = track;
    const secondsPerMeasure = (60 / globalBpm) * 4 * (numerator / denominator);
    return secondsPerMeasure / stepsPerMeasure;
  }, [allTrackInfo, globalBpm]);

  const clearScheduledEvents = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
    Tone.getDraw().cancel();
  }, []);

  const stopSequencer = useCallback(() => {
    setStatus(SequenceStatus.Stopped);
    Tone.getTransport().stop();
    clearScheduledEvents();
    stepCounterRef.current = 0; // Reset step counter
    setCurrentStep(0);
  }, [setStatus, clearScheduledEvents, setCurrentStep]);

  const scheduleSequence = useCallback(() => {
    clearScheduledEvents();

    const shortestStepDuration = Math.min(
      ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
    );

    const maxStepIndex = Math.max(
      ...steps.map(step => step.stepIndex),
      ...allTrackInfo.map(track => track.stepsPerMeasure - 1)
    );

    loopRef.current = new Tone.Loop((time) => {
      // Get fresh state for each step
      const currentSteps = useSequencerStore.getState().steps;
      const currentTrackInfo = useSequencerStore.getState().trackInfo;

      const soloTrackExists = currentTrackInfo.some(track => track.solo);

      // Update visual step
      Tone.getDraw().schedule(() => {
        setCurrentStep(stepCounterRef.current);
      }, time);

      // Play step with fresh state
      currentTrackInfo.forEach(track => {
        if (track.muted || (soloTrackExists && !track.solo)) return;

        const step = currentSteps.find(s =>
          s.trackIndex === track.trackIndex &&
          s.stepIndex === stepCounterRef.current
        );

        if (step?.active) {
          const instrument = instrumentManager.getInstrument(track.instrumentId);
          if (!instrument) return;

          const stepDuration = getStepDurationInSeconds(track.trackIndex);
          const velocity = track.commonVelocity ?? step.velocity;
          const note = track.commonNote ?? step.note;

          if (instrument instanceof Tone.NoiseSynth) {
            instrument.triggerAttackRelease(stepDuration, time, velocity / 127);
          } else {
            instrument.triggerAttackRelease(note, stepDuration, time, velocity / 127);
          }
        }
      });

      // Increment step counter
      stepCounterRef.current = (stepCounterRef.current + 1) % (maxStepIndex + 1);

      // Handle loop end
      if (stepCounterRef.current === 0 && !loopEnabled) {
        Tone.getDraw().schedule(() => {
          stopSequencer();
        }, time + shortestStepDuration);
      }
    }, shortestStepDuration);

    loopRef.current.start(0);
  }, [
    clearScheduledEvents,
    allTrackInfo,
    steps,
    getStepDurationInSeconds,
    loopEnabled,
    stopSequencer,
    setCurrentStep
  ]);

  const startSequencer = useCallback(async () => {
    if (status === SequenceStatus.Playing) return;

    if (status === SequenceStatus.Paused) {
      setStatus(SequenceStatus.Playing);
      Tone.getTransport().start();
      return;
    }

    await Tone.start();
    Tone.getTransport().bpm.value = globalBpm;
    stepCounterRef.current = 0; // Reset step counter
    setStatus(SequenceStatus.Playing);

    scheduleSequence();
    Tone.getTransport().start();
  }, [status, globalBpm, scheduleSequence, setStatus]);


  const pauseSequencer = useCallback(() => {
    if (status !== SequenceStatus.Playing) return;

    setStatus(SequenceStatus.Paused);
    Tone.getTransport().pause();
  }, [status, setStatus]);

  // Effect for BPM changes
  useEffect(() => {
    Tone.getTransport().bpm.value = globalBpm;
  }, [globalBpm]);

  // Effect for cleanup
  useEffect(() => {
    return () => {
      clearScheduledEvents();
      Tone.getTransport().stop();
      stepCounterRef.current = 0;
    };
  }, [clearScheduledEvents]);

  // Effect for step changes during playback
  useEffect(() => {
    if (status === SequenceStatus.Playing) {
      const currentStepCount = stepCounterRef.current; // Save current position
      scheduleSequence();
      stepCounterRef.current = currentStepCount; // Restore position
    }
  }, [steps, status, scheduleSequence]);

  // Effect for track info changes during playback
  useEffect(() => {
    if (status === SequenceStatus.Playing) {
      const currentStepCount = stepCounterRef.current;
      scheduleSequence();
      stepCounterRef.current = currentStepCount;
    }
  }, [allTrackInfo, status, scheduleSequence]);

  return {
    startSequencer,
    stopSequencer,
    pauseSequencer,
    status,
    loopEnabled,
    setLoopEnabled,
  };
};
