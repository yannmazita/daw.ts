// File: sequencerStore.ts
// Description: Provides a store for managing the state of the sequencer in the application.

import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { StepPosition } from '@/utils/interfaces';

/**
 * Defines the store for managing sequencer data.
 */
export const useSequencerStore = defineStore('sequencer', () => {
    // Playback state
    const isPlaying = ref(false);
    const bpm = ref(120);
    const currentStep = ref(0);
    const visualStep = ref(0);

    // Sequence structure
    const numTracks = ref(4);
    const numSteps = ref(16);
    const tracks = ref<SequencerTrack[]>([]);
    const stepDuration = ref('16n');
    const timeSignature = ref<[number, number]>([4, 4]);

    // Right-click selection
    const rightClickStepPos: StepPosition = reactive({ trackIndex: -1, stepIndex: -1 });
    const rightClickTrackPos = ref(-1);

    // Methods for step management
    function setStepActive(trackIndex: number, stepIndex: number, active: boolean) {
        if (trackIndex >= 0 && trackIndex < tracks.value.length &&
            stepIndex >= 0 && stepIndex < numSteps.value) {
            tracks.value[trackIndex].steps[stepIndex].active = active;
        }
    }

    function toggleStepActive(trackIndex: number, stepIndex: number) {
        if (trackIndex >= 0 && trackIndex < tracks.value.length &&
            stepIndex >= 0 && stepIndex < numSteps.value) {
            const step = tracks.value[trackIndex].steps[stepIndex];
            step.active = !step.active;
        }
    }

    // Methods for right-click selection
    function rightClickSelectStep(position: StepPosition) {
        rightClickStepPos.trackIndex = position.trackIndex;
        rightClickStepPos.stepIndex = position.stepIndex;
    }

    function rightClickSelectTrack(trackIndex: number) {
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
        setStepActive,
        toggleStepActive,
        visualStep,
        stepDuration,
        timeSignature,
    };
});
