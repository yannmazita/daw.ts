// src/stores/stuctureStore.ts
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { SequenceStructure, StepPosition } from '@/utils/interfaces';
import {
    InvalidTrackNumberException,
    InvalidStepNumberException,
    InvalidStepDurationException,
    InvalidTimeSignatureException,
    InvalidStepPositionException,
} from '@/utils/exceptions';

export const useStructureStore = defineStore('structure', () => {
    const state: SequenceStructure = reactive({
        numTracks: 4,
        numSteps: 16,
        stepDuration: '16n',
        timeSignature: [4, 4],
    });

    const rightClickSelectionPos: StepPosition = reactive({ trackIndex: -1, stepIndex: -1 });

    function setNumTracks(num: number) {
        if (num < 1) {
            throw new InvalidTrackNumberException(num);
        }
        state.numTracks = num;
    }

    function setNumSteps(num: number) {
        if (num < 1) {
            throw new InvalidStepNumberException(num);
        }
        state.numSteps = num;
    }

    function setStepDuration(duration: string) {
        if (!/^\d+n$/.test(duration)) {
            throw new InvalidStepDurationException(duration);
        }
        state.stepDuration = duration;
    }

    function setTimeSignature(numerator: number, denominator: number) {
        if (numerator < 1 || denominator < 1) {
            throw new InvalidTimeSignatureException(numerator, denominator);
        }
        state.timeSignature = [numerator, denominator];
    }

    function rightClickSelect(position: StepPosition) {
        if (position.trackIndex < -1 || position.trackIndex >= state.numTracks || position.stepIndex < -1 || position.stepIndex >= state.numSteps) {
            throw new InvalidStepPositionException(position.trackIndex, position.stepIndex);
        }
        rightClickSelectionPos.trackIndex = position.trackIndex;
        rightClickSelectionPos.stepIndex = position.stepIndex;
    }

    function clearRightClickSelect() {
        rightClickSelectionPos.trackIndex = -1;
        rightClickSelectionPos.stepIndex = -1;
    }

    function isTrackSelectionValid(): boolean {
        return rightClickSelectionPos.trackIndex >= 0 && rightClickSelectionPos.trackIndex < state.numTracks;
    }

    function isStepSelectionValid(): boolean {
        return rightClickSelectionPos.stepIndex >= 0 && rightClickSelectionPos.stepIndex < state.numSteps;
    }

    return {
        state,
        rightClickSelectionPos,
        setNumTracks,
        setNumSteps,
        setStepDuration,
        setTimeSignature,
        rightClickSelect,
        clearRightClickSelect,
        isTrackSelectionValid,
        isStepSelectionValid,
    };
});
