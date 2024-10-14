// src/stores/playbackStore.ts
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { PlaybackState } from '@/utils/interfaces';
import { SequenceStatus } from '@/utils/types';
import { useTrackStore } from '@/stores/trackStore';
import { InvalidBpmException, InvalidStepDurationException, InvalidStepIndexException, InvalidTimeSignatureException } from '@/utils/exceptions';

export const usePlaybackStore = defineStore('playback', () => {
    const trackStore = useTrackStore();
    const state: PlaybackState = reactive({
        status: SequenceStatus.Stopped,
        bpm: 120,
        currentStep: 0,
        visualStep: 0,
        stepDuration: '16n',
        timeSignature: [4, 4],
    });

    function validateStepIndex(stepIndex: number): void {
        if (stepIndex < 0 || stepIndex >= trackStore.tracks[0].steps.length && stepIndex !== 0) {
            throw new InvalidStepIndexException(stepIndex);
        }
    }

    function setStatus(newStatus: SequenceStatus) {
        state.status = newStatus;
    }

    function setBpm(newBpm: number) {
        if (newBpm < 0) {
            throw new InvalidBpmException(newBpm);
        }
        state.bpm = newBpm;
    }

    function setCurrentStep(step: number) {
        validateStepIndex(step);
        state.currentStep = step;
    }

    function setVisualStep(step: number) {
        validateStepIndex(step);
        state.visualStep = step;
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

    return {
        state,
        setStatus,
        setBpm,
        setCurrentStep,
        setVisualStep,
        setStepDuration,
        setTimeSignature,
    };
});
