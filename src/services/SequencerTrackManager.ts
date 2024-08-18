import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerPlaybackManager } from './SequencerPlaybackManager';

export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    constructor(private sequencerPlaybackManager: SequencerPlaybackManager) {
        this.initializeTracks();
    }

    private initializeTracks(): void {
        this.sequencerStore.tracks = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
    }

    public addTrack(trackIndex: number = this.sequencerStore.numTracks, numSteps: number = this.sequencerStore.numSteps): void {
        this.sequencerPlaybackManager.stopSequence();
        const newTrack = new SequencerTrack(trackIndex, numSteps);
        this.sequencerStore.tracks.push(newTrack);
        this.sequencerStore.numTracks++;
    }

    public setNumTracks(newCount: number): void {
        this.sequencerPlaybackManager.stopSequence();
        if (newCount < this.sequencerStore.tracks.length) {
            this.sequencerStore.tracks = this.sequencerStore.tracks.slice(0, newCount);
        } else {
            const newTracks = Array.from({ length: newCount - this.sequencerStore.tracks.length }, (_, i) =>
                new SequencerTrack(this.sequencerStore.tracks.length + i, this.sequencerStore.numSteps)
            );
            this.sequencerStore.tracks = [...this.sequencerStore.tracks, ...newTracks];
        }
        this.sequencerStore.numTracks = newCount;
    }

    public setNumSteps(newCount: number): void {
        this.sequencerPlaybackManager.stopSequence();
        this.sequencerStore.tracks.forEach(track => {
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
        this.sequencerStore.tracks[trackIndex].steps[stepIndex].toggleStepActiveState();
    }
}
