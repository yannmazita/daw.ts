import { ref, Ref } from 'vue';
import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';
import { useSequencerStore } from '@/stores/sequencerStore';

export class SequencerTrackManager {
    public tracks: Ref<SequencerTrack[]> = ref([]);
    private sequencerStore = useSequencerStore();

    constructor() {
        this.initializeTracks();
    }

    private initializeTracks(): void {
        this.tracks.value = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
    }

    public addTrack(numSteps: number): void {
        const newTrack = new SequencerTrack(this.tracks.value.length, numSteps);
        this.tracks.value.push(newTrack);
        this.sequencerStore.numTracks++;
    }

    public setNumTracks(newCount: number): void {
        if (newCount < this.tracks.value.length) {
            this.tracks.value = this.tracks.value.slice(0, newCount);
        } else {
            const newTracks = Array.from({ length: newCount - this.tracks.value.length }, (_, i) =>
                new SequencerTrack(this.tracks.value.length + i, this.sequencerStore.numSteps)
            );
            this.tracks.value = [...this.tracks.value, ...newTracks];
        }
        this.sequencerStore.numTracks = newCount;
    }

    public setNumSteps(newCount: number): void {
        this.tracks.value.forEach(track => {
            if (newCount < track.steps.length) {
                track.steps.splice(newCount);
            } else {
                for (let i = track.steps.length; i < newCount; i++) {
                    track.steps.push(new SequencerStep());
                }
            }
        });
        this.sequencerStore.numSteps = newCount;
    }

    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        this.tracks.value[trackIndex].steps[stepIndex].toggleStepActiveState();
    }
}
