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

    public addTracks(insertPosition: number = this.sequencerStore.numTracks, upOrDown: string = "down", numberOfTracks: number = 1): void {
        this.sequencerPlaybackManager.stopSequence();

        const newTracks = Array.from({ length: numberOfTracks }, (_, i) =>
            new SequencerTrack(insertPosition + i, this.sequencerStore.numSteps)
        );

        if (upOrDown === "up") {
            insertPosition = Math.max(0, insertPosition - numberOfTracks);
            this.sequencerStore.tracks.splice(insertPosition, 0, ...newTracks);

        }
        else if (upOrDown === "down") {
            this.sequencerStore.tracks.splice(insertPosition + 1, 0, ...newTracks);
        }

        // Every track following the block of inserted tracks still has its old id, we're updating it
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.id !== trackIndex) {
                track.id = trackIndex;
            }
        });
        this.sequencerStore.numTracks = this.sequencerStore.numTracks + numberOfTracks;
    }

    public removeTracks(deletePosition: number = this.sequencerStore.numTracks - 1, numberOfTracks: number = 1): void {
        this.sequencerPlaybackManager.stopSequence();
        this.sequencerStore.tracks.splice(deletePosition, numberOfTracks);
        this.sequencerStore.numTracks = this.sequencerStore.numTracks - numberOfTracks;
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
