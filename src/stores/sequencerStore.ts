// File: sequencerStore.ts
// Description: Provides a store for managing the state of the sequencer in the application.

import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { StepPosition } from '@/utils/interfaces';

/**
 * Defines the store for managing sequencer data.
 */
export const useSequencerStore = defineStore('sequencer', () => {
    // Playback state
    const isPlaying = ref(false);
    const isLooping = computed(() => loopEnabled.value && loopStart.value < loopEnd.value);
    const bpm = ref(120);
    const currentStep = ref(0);
    const visualStep = ref(0);

    // Sequence structure
    const numTracks = ref(4);
    const numSteps = ref(16);
    const tracks = ref<SequencerTrack[]>([]);

    // Loop and playback boundaries
    const loopEnabled = ref(false);
    const loopStart = ref(0);
    const loopEnd = ref(numSteps.value);
    const playbackStart = ref(0);
    const playbackEnd = ref(numSteps.value);

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

    // Methods for playback control
    function setPlaybackPosition(step: number) {
        currentStep.value = step;
        visualStep.value = step;
    }

    function advancePlaybackPosition() {
        currentStep.value = (currentStep.value + 1) % numSteps.value;
        visualStep.value = currentStep.value;

        if (isLooping.value) {
            if (currentStep.value >= loopEnd.value) {
                setPlaybackPosition(loopStart.value);
            }
        } else if (currentStep.value >= playbackEnd.value) {
            setPlaybackPosition(playbackStart.value);
        }
    }

    function setLoopPoints(start: number, end: number) {
        loopStart.value = Math.max(0, Math.min(start, numSteps.value - 1));
        loopEnd.value = Math.max(loopStart.value + 1, Math.min(end, numSteps.value));
    }

    function setPlaybackBoundaries(start: number, end: number) {
        playbackStart.value = Math.max(0, Math.min(start, numSteps.value - 1));
        playbackEnd.value = Math.max(playbackStart.value + 1, Math.min(end, numSteps.value));
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
        setPlaybackPosition,
        advancePlaybackPosition,
        setLoopPoints,
        setPlaybackBoundaries,
        visualStep,
    };
});
