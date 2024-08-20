import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerPlaybackManager } from './SequencerPlaybackManager';
import { SequencerInstrumentManager } from './SequencerInstrumentManager';

export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    constructor(private playbackManager: SequencerPlaybackManager, private instrumentManager: SequencerInstrumentManager) {
        this.initializeTracks();
    }

    private initializeTracks(): void {
        this.sequencerStore.tracks = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
        this.instrumentManager.initializeTrackInstruments();
    }

    private updateTrackIds(): void {
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.id !== trackIndex) {
                track.id = trackIndex;
            }
        });
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    private triggerReactivityUpdate(): void {
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    public addTrack(insertPosition: number = this.sequencerStore.numTracks): void {
        this.playbackManager.stopSequence();
        const newTrack = new SequencerTrack(insertPosition + 1, this.sequencerStore.numSteps);
        this.sequencerStore.tracks.splice(insertPosition + 1, 0, newTrack);
        this.updateTrackIds();
        this.triggerReactivityUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks + 1;
        this.instrumentManager.addInstrumentForTrack(insertPosition + 1);
    }

    public removeTrack(deletePosition: number = this.sequencerStore.numTracks): void {
        this.playbackManager.stopSequence();
        this.sequencerStore.tracks.splice(deletePosition, 1);
        this.updateTrackIds();
        this.triggerReactivityUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks - 1;
        this.instrumentManager.removeInstrumentForTrack(deletePosition);
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
        this.sequencerStore.tracks.forEach((_, trackId) => {
            this.instrumentManager.addInstrumentForTrack(trackId);
        }
        );
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
        this.triggerReactivityUpdate();
        this.sequencerStore.numSteps = newCount;
    }

    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        this.sequencerStore.tracks[trackIndex].steps[stepIndex].toggleStepActiveState();
    }
}
