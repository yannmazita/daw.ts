// File: sequencerStore.ts
// Description: Provides a store for managing the state of the sequencer in the application.

import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { reactive, ref, Ref } from 'vue';
import { StepPosition } from '@/utils/interfaces';

/**
 * Defines the store for managing sequencer data.
 */
export const useSequencerStore = defineStore('sequencer', () => {
    const isPlaying: Ref<boolean> = ref(false);
    const bpm: Ref<number> = ref(120);
    const numTracks: Ref<number> = ref(4);
    const numSteps: Ref<number> = ref(16);
    const currentStep: Ref<number> = ref(0);
    const tracks: Ref<SequencerTrack[]> = ref([]);
    const rightClickStepPos: StepPosition = reactive({ trackIndex: null, stepIndex: null });
    const rightClickTrackPos: Ref<number | null> = ref(null);

    /**
     * Records the position of a right-click on a step for context-sensitive actions.
     * @param trackIndex The index of the track where the step is located.
     * @param stepIndex The index of the step within the track.
     */
    function rightClickSelectStep(trackIndex: number, stepIndex: number): void {
        rightClickStepPos.trackIndex = trackIndex;
        rightClickStepPos.stepIndex = stepIndex;
    }

    /**
     * Records the position of a right-click on a track for context-sensitive actions.
     * @param trackIndex The index of the track.
     */
    function rightClickSelectTrack(trackIndex: number): void {
        rightClickTrackPos.value = trackIndex;
    }

    /**
     * Clears the recorded position of a right-click on a step.
     */
    function clearRightClickSelectStepPos(): void {
        rightClickStepPos.trackIndex = null;
        rightClickStepPos.stepIndex = null;
    }

    /**
     * Clears the recorded position of a right-click on a track.
     */
    function clearRightClickSelectTrackPos(): void {
        rightClickTrackPos.value = null;
    }

    return {
        bpm,
        numTracks,
        numSteps,
        currentStep,
        tracks,
        rightClickStepPos,
        rightClickSelectStep,
        clearRightClickSelectStepPos,
        rightClickTrackPos,
        rightClickSelectTrack,
        clearRightClickSelectTrackPos,
        isPlaying,
    };
});
