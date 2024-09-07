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
    const rightClickStepPos: StepPosition = reactive({ trackIndex: -1, stepIndex: -1 });
    const rightClickTrackPos: Ref<number> = ref(-1);

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
        rightClickStepPos.trackIndex = -1;
        rightClickStepPos.stepIndex = -1;
    }

    /**
     * Clears the recorded position of a right-click on a track.
     */
    function clearRightClickSelectTrackPos(): void {
        rightClickTrackPos.value = -1;
    }

    /**
     * Checks if the right-click track position is valid.
     * @returns True if the right-click step position is valid, false otherwise.
     */
    function isRightClickTrackPosValid(): boolean {
        return rightClickTrackPos.value !== -1;
    }

    /**
     * Checks if the right-click step position is valid.
     * @returns True if the right-click step position is valid, false otherwise.
     */
    function isRightClickStepPosValid(): boolean {
        return rightClickStepPos.trackIndex !== -1 && rightClickStepPos.stepIndex !== -1;
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
        isRightClickStepPosValid,
        isRightClickTrackPosValid,
    };
});
