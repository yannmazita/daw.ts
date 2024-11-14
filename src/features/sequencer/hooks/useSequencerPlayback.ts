// src/features/sequencer/hooks/useSequencerPlayback.ts

import * as Tone from 'tone';
import { useSequencerStore } from '../slices/useSequencerStore';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';
import { SequenceStatus } from '@/core/enums/sequenceStatus';
import { useCallback, useEffect, useRef } from 'react';

export const useSequencerPlayback = () => {
  const status = useSequencerStore(state => state.status);
  const setStatus = useSequencerStore(state => state.setStatus);
  const steps = useSequencerStore(state => state.steps);
  const allTrackInfo = useSequencerStore(state => state.trackInfo);
  const globalBpm = useSequencerStore(state => state.globalBpm);
  const setCurrentStep = useSequencerStore(state => state.setCurrentStep);
  
  const loopRef = useRef<Tone.Loop | null>(null);

  const getStepDurationInSeconds = useCallback((trackIndex: number): number => {
    const track = allTrackInfo[trackIndex];
    const { timeSignature: [numerator, denominator], stepsPerMeasure } = track;
    
    // Calculate seconds per measure based on time signature and BPM
    const secondsPerMeasure = (60 / globalBpm) * 4 * (numerator / denominator);
    
    // Calculate duration of one step
    return secondsPerMeasure / stepsPerMeasure;
  }, [allTrackInfo, globalBpm]);

  const calculateStepIndex = useCallback((trackIndex: number, currentTime: number): number => {
    const track = allTrackInfo[trackIndex];
    const stepDuration = getStepDurationInSeconds(trackIndex);
    
    // Calculate step index based on current time and loop length
    const totalSteps = Math.floor(currentTime / stepDuration);
    return totalSteps % track.loopLength;
  }, [allTrackInfo, getStepDurationInSeconds]);

  const playStep = useCallback((time: number): void => {
    const currentTime = Tone.getTransport().seconds;
    const soloTrackExists = allTrackInfo.some(track => track.solo);
    
    allTrackInfo.forEach(track => {
      if (track.muted || (soloTrackExists && !track.solo)) {
        return;
      }

      const stepIndex = calculateStepIndex(track.trackIndex, currentTime);
      const activeSteps = steps.filter(step => 
        step.trackIndex === track.trackIndex && 
        step.stepIndex === stepIndex &&
        step.active
      );

      activeSteps.forEach(step => {
        const instrument = instrumentManager.getInstrument(track.instrumentId);
        if (instrument) {
          const stepDuration = getStepDurationInSeconds(track.trackIndex);
          instrument.triggerAttackRelease(
            step.note,
            stepDuration,
            time,
            step.velocity / 127
          );
        }
      });

      // Update current step in the UI
      Tone.getDraw().schedule(() => {
        setCurrentStep(stepIndex);
      }, time);
    });
  }, [steps, allTrackInfo, calculateStepIndex, getStepDurationInSeconds, setCurrentStep]);

  const startSequencer = useCallback(async () => {
    if (Tone.getTransport().state === 'started') {
      return;
    }

    await Tone.start();
    Tone.getTransport().bpm.value = globalBpm;

    if (!loopRef.current) {
      // Find the shortest step duration among all tracks
      const shortestStepDuration = Math.min(
        ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
      );

      loopRef.current = new Tone.Loop((time) => {
        playStep(time);
      }, shortestStepDuration);
    }

    loopRef.current.start(0);
    Tone.getTransport().start();
    setStatus(SequenceStatus.Playing);
  }, [globalBpm, playStep, setStatus, allTrackInfo, getStepDurationInSeconds]);

  const stopSequencer = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    setCurrentStep(0);
    setStatus(SequenceStatus.Stopped);
  }, [setCurrentStep, setStatus]);

  const pauseSequencer = useCallback(() => {
    Tone.getTransport().pause();
    setStatus(SequenceStatus.Paused);
  }, [setStatus]);

  useEffect(() => {
    Tone.getTransport().bpm.value = globalBpm;
  }, [globalBpm]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.dispose();
      }
      Tone.getTransport().stop();
    };
  }, []);

  return {
    startSequencer,
    stopSequencer,
    pauseSequencer,
    status,
  };
};
