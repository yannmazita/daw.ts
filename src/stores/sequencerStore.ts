import { defineStore } from 'pinia';
import { reactive, ref, Ref } from 'vue';
import { SequencerTrack, SequencerStep } from '@/models/SequencerModels.ts';


export const useSequencerStore = defineStore('sequencer', () => {
    const bpm: Ref<number> = ref(120);
    const numTracks: Ref<number> = ref(1);
    const numSteps: Ref<number> = ref(16);
    const currentStep: Ref<number> = ref(0);
    const tracks = reactive(Array.from({ length: numTracks.value }, (_, i) => new SequencerTrack(i, numSteps.value)));

    function adjustTrackCount(newCount: number) {
        if (newCount < tracks.length) {
            for (let i = tracks.length - 1; i >= newCount; i--) {
                //tracks[i].cleanup();
            }
            tracks.length = newCount;   // this actually deletes the array elements
        } else {
            for (let i = tracks.length; i < newCount; i++) {
                tracks.push(new SequencerTrack(i, numSteps.value));
            }
        }
        numTracks.value = newCount;
    }

    function adjustStepCount(newCount: number) {
        tracks.forEach(track => {
            if (newCount < track.steps.length) {
                // Remove extra steps
                track.steps.splice(newCount);
            } else {
                // Add missing steps
                for (let i = track.steps.length; i < newCount; i++) {
                    track.steps.push(new SequencerStep());
                }
            }
        });
        numSteps.value = newCount;
    }

    return {
        bpm,
        numTracks,
        numSteps,
        tracks,
        currentStep,
        adjustTrackCount,
        adjustStepCount,
    }
});
