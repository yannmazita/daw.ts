import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerPlaybackManager } from './SequencerPlaybackManager';

export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    constructor(private playbackManager: SequencerPlaybackManager) {
        this.initializeTracks();
    }

    private initializeTracks(): void {
        this.sequencerStore.tracks = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
    }

    private updateTrackIds(): void {
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.id !== trackIndex) {
                track.id = trackIndex;
            }
        });
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    private triggerReactiveUpdate(): void {
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    public addTrack(insertPosition: number = this.sequencerStore.numTracks): void {
        this.playbackManager.stopSequence();
        const newTrack = new SequencerTrack(insertPosition + 1, this.sequencerStore.numSteps);
        this.sequencerStore.tracks.splice(insertPosition + 1, 0, newTrack);
        this.updateTrackIds();
        this.triggerReactiveUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks + 1;
    }

    public removeTrack(deletePosition: number = this.sequencerStore.numTracks, numberOfTracks: number = 1): void {
        this.playbackManager.stopSequence();
        this.sequencerStore.tracks.splice(deletePosition, numberOfTracks);
        this.updateTrackIds();
        this.triggerReactiveUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks - numberOfTracks;
    }

    public setNumTracks(newCount: number): void {
        this.playbackManager.stopSequence();
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
        this.playbackManager.stopSequence();
        this.sequencerStore.tracks.forEach(track => {
            if (newCount < track.steps.length) {
                track.steps.splice(newCount);
            } else {
                for (let i = track.steps.length; i < newCount; i++) {
                    track.steps.push(new SequencerStep());
                }
            }
        });
        this.triggerReactiveUpdate();
        this.sequencerStore.numSteps = newCount;
    }

    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        this.sequencerStore.tracks[trackIndex].steps[stepIndex].toggleStepActiveState();
    }
}
