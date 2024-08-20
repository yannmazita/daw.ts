import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { reactive, ref, Ref } from 'vue';
import { StepPosition } from '@/utils/interfaces';


export const useSequencerStore = defineStore('sequencer', () => {
    const isPlaying: Ref<boolean> = ref(false);
    const bpm: Ref<number> = ref(120);
    const numTracks: Ref<number> = ref(4);
    const numSteps: Ref<number> = ref(16);
    const currentStep: Ref<number> = ref(0);
    const tracks: Ref<SequencerTrack[]> = ref([]);
    const rightClickStepPos: StepPosition = reactive({ trackIndex: null, stepIndex: null });
    const rightClickTrackPos: Ref<number | null> = ref(null);

    function rightClickSelectStep(trackIndex: number, stepIndex: number): void {
        rightClickStepPos.trackIndex = trackIndex;
        rightClickStepPos.stepIndex = stepIndex;
    }

    function rightClickSelectTrack(trackIndex: number): void {
        rightClickTrackPos.value = trackIndex;
    }

    function clearRightClickSelectStepPos(): void {
        rightClickStepPos.trackIndex = null;
        rightClickStepPos.stepIndex = null;
    }

    function clearRightClickSelectTrackPos(): void {
        rightClickTrackPos.value = null
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
    }
});
