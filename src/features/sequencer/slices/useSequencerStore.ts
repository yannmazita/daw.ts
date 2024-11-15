// src/features/sequencer/slices/useSequencerStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { } from '@redux-devtools/extension';
import { SequencerState, SequencerTrackInfo, SequencerStep } from '@/core/interfaces/sequencer';
import { InstrumentName, Note, SequenceStatus } from '@/core/enums';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';

export const useSequencerStore = create<SequencerState>()(
  devtools(
    (set, get) => ({
      status: SequenceStatus.Stopped,
      steps: [],
      trackInfo: [],
      globalBpm: 120,
      currentStep: 0,
      setStatus: (status: SequenceStatus) => set({ status }),
      setGlobalBpm: (globalBpm: number) => set({ globalBpm }),
      addTrack: (track: SequencerTrackInfo) => set((state) => ({ trackInfo: [...state.trackInfo, track] })),
      updateTrackInfo: (update: Partial<SequencerTrackInfo> & { trackIndex: number }) => set((state) => {
        const newTrackInfo = state.trackInfo.map(track =>
          track.trackIndex === update.trackIndex ? { ...track, ...update } : track
        );
        return { trackInfo: newTrackInfo };
      }),
      updateStepsForTrack: (trackIndex: number, updatedSteps: SequencerStep[]) => set((state) => {
        const newSteps = state.steps.filter(step => step.trackIndex !== trackIndex).concat(updatedSteps);
        return { steps: newSteps };
      }),
      setStep: (newStep: SequencerStep) => set((state) => {
        const stepIndex = state.steps.findIndex(
          step => step.trackIndex === newStep.trackIndex && step.stepIndex === newStep.stepIndex
        );
        if (stepIndex !== -1) {
          const newSteps = [...state.steps];
          newSteps[stepIndex] = newStep;
          return { steps: newSteps };
        }
        return { steps: [...state.steps, newStep] };
      }),
      setSteps: (steps: SequencerStep[]) => set({ steps: steps.map(step => ({ ...step })) }),
      setCurrentStep: (currentStep: number) => set({ currentStep }),
      toggleStep: (trackIndex: number, stepIndex: number) => set((state) => {
        const trackInfo = state.trackInfo.find(t => t.trackIndex === trackIndex);
        if (!trackInfo) return state;

        const { loopLength, stepsPerMeasure } = trackInfo;
        const relativeStepIndex = stepIndex % loopLength; // Position within the loop

        // Find all steps that should be toggled based on the loop pattern
        const stepsToToggle = new Set<number>();
        for (let i = relativeStepIndex; i < stepsPerMeasure; i += loopLength) {
          stepsToToggle.add(i);
        }

        // Find the current state of the clicked step to determine the new active state
        const clickedStep = state.steps.find(
          s => s.trackIndex === trackIndex && s.stepIndex === stepIndex
        );
        const newActiveState = clickedStep ? !clickedStep.active : true;

        // Update all affected steps
        const newSteps = state.steps.map(step => {
          if (
            step.trackIndex === trackIndex &&
            stepsToToggle.has(step.stepIndex)
          ) {
            return { ...step, active: newActiveState };
          }
          return step;
        });
        return { steps: newSteps };
      }),
      initializeTracks: (numTracks: number) => set((state) => {
        const trackInfo = Array.from({ length: numTracks }, (_, index) => ({
          trackIndex: index,
          instrumentId: '',
          instrumentName: InstrumentName.Synth,
          muted: false,
          solo: false,
          timeSignature: [4, 4] as [number, number],
          stepDuration: '4n',
          stepsPerMeasure: 16,
          bpm: state.globalBpm,
          commonVelocity: 100,
          commonNote: Note.C4,
          loopLength: 16,
        }));

        const steps = trackInfo.flatMap(track =>
          Array.from({ length: 16 }, (_, stepIndex) => ({
            trackIndex: track.trackIndex,
            stepIndex,
            active: false,
            note: track.commonNote,
            velocity: track.commonVelocity,
            modulation: 0,
            pitchBend: 0,
          }))
        );

        return { trackInfo, steps };
      }),
      updateTrackInfoAndSteps: (trackInfoUpdate: Partial<SequencerTrackInfo> & { trackIndex: number }) => set((state) => {
        const updatedTrackInfo = state.trackInfo.find(t => t.trackIndex === trackInfoUpdate.trackIndex);

        if (!updatedTrackInfo) {
          throw new Error(`Track with index ${trackInfoUpdate.trackIndex} not found`);
        }

        // Handle loop length changes
        if ('loopLength' in trackInfoUpdate) {
          const newSteps = state.steps.map(step => {
            if (
              trackInfoUpdate.loopLength !== undefined && step.trackIndex === trackInfoUpdate.trackIndex &&
              step.stepIndex >= trackInfoUpdate.loopLength
            ) {
              return { ...step, active: false };
            }
            return step;
          });

          return {
            trackInfo: state.trackInfo.map(track =>
              track.trackIndex === trackInfoUpdate.trackIndex
                ? { ...track, ...trackInfoUpdate }
                : track
            ),
            steps: newSteps
          };
        }

        // Handle time signature or step duration changes
        if (trackInfoUpdate.timeSignature || trackInfoUpdate.stepDuration) {
          const newStepsPerMeasure = calculateStepsPerMeasure(
            trackInfoUpdate.timeSignature ?? updatedTrackInfo.timeSignature,
            trackInfoUpdate.stepDuration ?? updatedTrackInfo.stepDuration
          );

          const currentSteps = state.steps.filter(step =>
            step.trackIndex === trackInfoUpdate.trackIndex
          );

          let updatedSteps: SequencerStep[] = [];

          if (currentSteps.length > newStepsPerMeasure) {
            // If reducing steps, just slice
            updatedSteps = currentSteps.slice(0, newStepsPerMeasure);
          } else if (currentSteps.length < newStepsPerMeasure) {
            // Keep existing steps
            updatedSteps = [...currentSteps];

            // Calculate loop pattern for new steps
            const loopLength = updatedTrackInfo.loopLength;
            const existingPattern = new Set<number>();

            // Find active steps within the loop
            currentSteps.forEach(step => {
              if (step.active && step.stepIndex < loopLength) {
                existingPattern.add(step.stepIndex % loopLength);
              }
            });

            // Add new steps following the loop pattern
            for (let i = currentSteps.length; i < newStepsPerMeasure; i++) {
              const relativePosition = i % loopLength;
              updatedSteps.push({
                trackIndex: trackInfoUpdate.trackIndex,
                stepIndex: i,
                active: existingPattern.has(relativePosition),
                note: updatedTrackInfo.commonNote ?? Note.C4,
                velocity: updatedTrackInfo.commonVelocity ?? 100,
                modulation: 0,
                pitchBend: 0,
              });
            }
          } else {
            updatedSteps = currentSteps;
          }

          return {
            trackInfo: state.trackInfo.map(track =>
              track.trackIndex === trackInfoUpdate.trackIndex
                ? { ...track, ...trackInfoUpdate, stepsPerMeasure: newStepsPerMeasure }
                : track
            ),
            steps: [
              ...state.steps.filter(step => step.trackIndex !== trackInfoUpdate.trackIndex),
              ...updatedSteps
            ]
          };
        }

        // If no special handling needed, just update the track info
        return {
          trackInfo: state.trackInfo.map(track =>
            track.trackIndex === trackInfoUpdate.trackIndex
              ? { ...track, ...trackInfoUpdate }
              : track
          )
        };
      }),
      setTrackInstrument: (trackIndex: number, instrumentName: InstrumentName) => {
        const instrumentId = `instrument_${trackIndex}_${Date.now()}`;
        instrumentManager.addInstrument(instrumentId, instrumentName);
        set((state) => ({
          trackInfo: state.trackInfo.map(track =>
            track.trackIndex === trackIndex
              ? { ...track, instrumentId, instrumentName }
              : track
          )
        }));
      },
      initializeSequencer: (numTracks: number) => {
        get().initializeTracks(numTracks);

        for (let i = 0; i < numTracks; i++) {
          get().setTrackInstrument(i, InstrumentName.Synth);
        }
      },
    }),
    { name: 'sequencer-storage' }
  ),
);

// Utility functions
const calculateStepsPerMeasure = (timeSignature: [number, number], stepDuration: string): number => {
  const [numerator, denominator] = timeSignature;
  const stepDurationMap: Record<string, number> = {
    '1n': 1, '2n': 2, '4n': 4, '8n': 8, '16n': 16, '32n': 32
  };
  return (numerator * stepDurationMap[stepDuration]) / (denominator / 4);
};
