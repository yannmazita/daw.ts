import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';


export const useSequencerStore = defineStore('sequencer', () => {
    const bpm: Ref<number> = ref(120);
    const numTracks: Ref<number> = ref(4);
    const numSteps: Ref<number> = ref(16);
    const currentStep: Ref<number> = ref(0);
    const tracks: Ref<SequencerTrack[]> = ref([]);


    return {
        bpm,
        numTracks,
        numSteps,
        currentStep,
        tracks,
    }
});
