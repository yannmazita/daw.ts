// src/stores/playbackStore.ts
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { PlaybackState } from '@/utils/interfaces';
import { SequenceStatus } from '@/utils/types';
import { useTrackStore } from '@/stores/trackStore';
import { InvalidBpmException, InvalidStepIndexException } from '@/utils/exceptions';

export const usePlaybackStore = defineStore('playback', () => {
    const trackStore = useTrackStore();
    const state: PlaybackState = reactive({
        status: SequenceStatus.Stopped,
        bpm: 120,
        currentStep: 0,
        visualStep: 0,
    });

    function validateStepIndex(stepIndex: number): void {
        if (stepIndex < 0 || stepIndex >= trackStore.tracks[0].steps.length) {
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

    return {
        state,
        setStatus,
        setBpm,
        setCurrentStep,
        setVisualStep,
    };
});
