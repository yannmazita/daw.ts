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

  const playStep = useCallback((stepIndex: number, time: number): void => {
    const soloTrackExists = allTrackInfo.some(track => track.solo);

    // Update visual step
    Tone.getDraw().schedule(() => {
      setCurrentStep(stepIndex);
    }, time);

    allTrackInfo.forEach(track => {
      if (track.muted || (soloTrackExists && !track.solo)) return;

      const step = steps.find(s =>
        s.trackIndex === track.trackIndex &&
        s.stepIndex === stepIndex
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
  }, [steps, allTrackInfo, getStepDurationInSeconds, setCurrentStep]);

  const stopSequencer = useCallback(() => {
    setStatus(SequenceStatus.Stopped);
    Tone.getTransport().stop();
    clearScheduledEvents();
    stepCounterRef.current = 0; // Reset step counter
    setCurrentStep(0);
  }, [setStatus, clearScheduledEvents, setCurrentStep]);

  const scheduleSequence = useCallback(() => {
    clearScheduledEvents();

    // Use the shortest step duration among all tracks for the loop interval
    const shortestStepDuration = Math.min(
      ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
    );

    // Get the maximum step index across all tracks
    const maxStepIndex = Math.max(
      ...steps.map(step => step.stepIndex),
      ...allTrackInfo.map(track => track.stepsPerMeasure - 1)
    );

    loopRef.current = new Tone.Loop((time) => {
      playStep(stepCounterRef.current, time);

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
    playStep,
    steps,
    allTrackInfo,
    getStepDurationInSeconds,
    loopEnabled,
    stopSequencer
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

  useEffect(() => {
    Tone.getTransport().bpm.value = globalBpm;
  }, [globalBpm]);

  useEffect(() => {
    return () => {
      clearScheduledEvents();
      Tone.getTransport().stop();
      stepCounterRef.current = 0;
    };
  }, [clearScheduledEvents]);

  return {
    startSequencer,
    stopSequencer,
    pauseSequencer,
    status,
    loopEnabled,
    setLoopEnabled,
  };
};
