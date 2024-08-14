import { defineStore } from 'pinia';
import { reactive, ref, Ref } from 'vue';
import { SequencerTrack, SequencerStep } from '@/models/SequencerModels.ts';


export const useSequencerStore = defineStore('sequencer', () => {
    const bpm: Ref<number> = ref(120);
    const numTracks: Ref<number> = ref(1);
    const numSteps: Ref<number> = ref(16);
    const currentStep: Ref<number> = ref(0);
    const tracks = reactive(Array.from({ length: numTracks.value }, (_, i) => new SequencerTrack(i, numSteps.value)));

    function addTrack(trackId: number): void {
        tracks.push(new SequencerTrack(trackId, numSteps.value));
    }

    function removeTracks(newTrackCount: number): void {
        tracks.splice(newTrackCount, tracks.length - newTrackCount);
    }

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
    }

    return {
        bpm,
        numTracks,
        numSteps,
        tracks,
        addTrack,
        removeTracks,
        currentStep,
        adjustTrackCount,
    }
});
