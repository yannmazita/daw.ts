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
  const currentStep = useSequencerStore(state => state.currentStep);
  const setCurrentStep = useSequencerStore(state => state.setCurrentStep);
  
 const loopRef = useRef<Tone.Loop | null>(null);
  const playbackStartTimeRef = useRef<number | null>(null);
  const lastManuallySelectedStepRef = useRef<number | null>(null);
  const visualStepRef = useRef<number>(0);
  const [loopEnabled, setLoopEnabled] = useState(true);

  const getStepDurationInSeconds = useCallback((trackIndex: number): number => {
    const track = allTrackInfo[trackIndex];
    const { timeSignature: [numerator, denominator], stepsPerMeasure } = track;
    const secondsPerMeasure = (60 / globalBpm) * 4 * (numerator / denominator);
    return secondsPerMeasure / stepsPerMeasure;
  }, [allTrackInfo, globalBpm]);

  const updateVisualStep = useCallback((stepIndex: number, time: number) => {
    if (visualStepRef.current !== stepIndex) {
      Tone.getDraw().schedule(() => {
        visualStepRef.current = stepIndex;
        setCurrentStep(stepIndex);
      }, time);
    }
  }, [setCurrentStep]);

  const clearScheduledEvents = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
    Tone.getDraw().cancel(); // Cancel any pending visual updates
  }, []);

  const resetPlaybackPosition = useCallback(() => {
    visualStepRef.current = 0;
    setCurrentStep(0);
    lastManuallySelectedStepRef.current = null;
  }, [setCurrentStep]);

  const calculateCurrentStep = useCallback((time: number): number => {
    if (playbackStartTimeRef.current === null) return 0;
    
    const elapsedTime = time - playbackStartTimeRef.current;
    const shortestStepDuration = Math.min(
      ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
    );
    const stepsElapsed = Math.floor(elapsedTime / shortestStepDuration);
    
    const maxLoopLength = Math.max(...allTrackInfo.map(track => track.loopLength));
    return stepsElapsed % maxLoopLength;
  }, [allTrackInfo, getStepDurationInSeconds]);

  const playCurrentStep = useCallback((stepIndex: number, time: number): void => {
    const soloTrackExists = allTrackInfo.some(track => track.solo);
    
    // Schedule visual update first
    updateVisualStep(stepIndex, time);
    
    allTrackInfo.forEach(track => {
      if (track.muted || (soloTrackExists && !track.solo)) return;

      const activeSteps = steps.filter(step => 
        step.trackIndex === track.trackIndex && 
        step.stepIndex === stepIndex &&
        step.active
      );

      activeSteps.forEach(step => {
        const instrument = instrumentManager.getInstrument(track.instrumentId);
        if (!instrument) return;

        const stepDuration = getStepDurationInSeconds(track.trackIndex);
        const velocity = track.commonVelocity ?? step.velocity;
        const note = track.commonNote ?? step.note;

        // Schedule audio slightly ahead of visual update for better sync
        Tone.getDraw().schedule(() => {
          if (instrument instanceof Tone.NoiseSynth) {
            instrument.triggerAttackRelease(stepDuration, time, velocity / 127);
          } else {
            instrument.triggerAttackRelease(note, stepDuration, time, velocity / 127);
          }
        }, time - 0.05); // Schedule slightly ahead for better timing
      });
    });
  }, [steps, allTrackInfo, getStepDurationInSeconds, updateVisualStep]);

  const handleLooping = useCallback((currentStepIndex: number, time: number) => {
    const maxLoopLength = Math.max(...allTrackInfo.map(track => track.loopLength));
    
    if (currentStepIndex >= maxLoopLength - 1) {
      if (loopEnabled) {
        // Schedule loop point update
        Tone.getDraw().schedule(() => {
          playbackStartTimeRef.current = Tone.now();
        }, time);
      } else {
        // Schedule stop at loop end
        Tone.getDraw().schedule(() => {
          stopSequencer();
        }, time + getStepDurationInSeconds(0)); // Use first track's duration as reference
      }
    }
  }, [allTrackInfo, loopEnabled, getStepDurationInSeconds]);

  const scheduleSequence = useCallback(() => {
    clearScheduledEvents();

    const shortestStepDuration = Math.min(
      ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
    );

    loopRef.current = new Tone.Loop((time) => {
      const currentStepIndex = calculateCurrentStep(time);
      playCurrentStep(currentStepIndex, time);
      handleLooping(currentStepIndex, time);
    }, shortestStepDuration);

    loopRef.current.start(0);
  }, [
    clearScheduledEvents,
    calculateCurrentStep,
    playCurrentStep,
    handleLooping,
    allTrackInfo,
    getStepDurationInSeconds
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

    const startStep = lastManuallySelectedStepRef.current ?? currentStep;
    setStatus(SequenceStatus.Scheduled);

    // Schedule sequence start with visual feedback
    Tone.getDraw().schedule(() => {
      const shortestStepDuration = Math.min(
        ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
      );
      playbackStartTimeRef.current = Tone.now() - (shortestStepDuration * startStep);
      scheduleSequence();
      setStatus(SequenceStatus.Playing);
    }, '+0.1'); // Small delay for stable start

    Tone.getTransport().start();
    lastManuallySelectedStepRef.current = null;
  }, [
    status,
    globalBpm,
    currentStep,
    allTrackInfo,
    scheduleSequence,
    setStatus,
    getStepDurationInSeconds
  ]);

  const stopSequencer = useCallback(() => {
    Tone.getDraw().schedule(() => {
      setStatus(SequenceStatus.Stopped);
      Tone.getTransport().stop();
      clearScheduledEvents();
      resetPlaybackPosition();
    }, '+0.1');
  }, [setStatus, clearScheduledEvents, resetPlaybackPosition]);

  const pauseSequencer = useCallback(() => {
    if (status !== SequenceStatus.Playing) return;
    
    Tone.getDraw().schedule(() => {
      setStatus(SequenceStatus.Paused);
      Tone.getTransport().pause();
    }, '+0.1');
  }, [status, setStatus]);

  const seekTo = useCallback((stepIndex: number) => {
    Tone.getDraw().schedule(() => {
      setCurrentStep(stepIndex);
      visualStepRef.current = stepIndex;
      
      if (status === SequenceStatus.Playing) {
        const shortestStepDuration = Math.min(
          ...allTrackInfo.map(track => getStepDurationInSeconds(track.trackIndex))
        );
        playbackStartTimeRef.current = Tone.now() - (shortestStepDuration * stepIndex);
      } else if (status === SequenceStatus.Stopped) {
        lastManuallySelectedStepRef.current = stepIndex;
      }
    }, '+0.1');
  }, [status, allTrackInfo, setCurrentStep, getStepDurationInSeconds]);

  useEffect(() => {
    Tone.getTransport().bpm.value = globalBpm;
  }, [globalBpm]);

  useEffect(() => {
    if (status === SequenceStatus.Playing) {
      scheduleSequence();
    }
  }, [allTrackInfo, status, scheduleSequence]);

  useEffect(() => {
    return () => {
      clearScheduledEvents();
      Tone.getTransport().stop();
    };
  }, [clearScheduledEvents]);

  return {
    startSequencer,
    stopSequencer,
    pauseSequencer,
    seekTo,
    status,
    loopEnabled,
    setLoopEnabled,
    visualStep: visualStepRef.current,
  };
};
