// File: SequencerTrackManager.ts
// Description: Manages track operations within the sequencer, such as adding, removing, and updating tracks.

import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerPlaybackManager } from './SequencerPlaybackManager';
import { SequencerInstrumentManager } from './SequencerInstrumentManager';

/**
 * Manages the operations related to tracks in the sequencer, including their creation, deletion, and updating.
 */
export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    /**
     * Constructs the SequencerTrackManager.
     * @param playbackManager The playback manager to control sequence playback.
     * @param instrumentManager The instrument manager to manage instruments for tracks.
     */
    constructor(private playbackManager: SequencerPlaybackManager, private instrumentManager: SequencerInstrumentManager) {
        this.initializeTracks();
    }

    /**
     * Initializes tracks based on the number of tracks and steps specified in the sequencer store.
     */
    private initializeTracks(): void {
        this.sequencerStore.tracks = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
        this.instrumentManager.initializeTrackInstruments();
    }

    /**
     * Updates the IDs of the tracks to ensure they are in sync with their array indices.
     */
    private updateTrackIds(): void {
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.id !== trackIndex) {
                track.id = trackIndex;
            }
        });
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    /**
     * Triggers a reactivity update by reassessing the tracks array.
     */
    private triggerReactivityUpdate(): void {
        this.sequencerStore.tracks = [...this.sequencerStore.tracks];
    }

    /**
     * Adds a track to the sequencer at a specified position.
     * @param insertPosition The position at which to insert the new track.
     */
    public addTrack(insertPosition: number = this.sequencerStore.numTracks): void {
        this.playbackManager.stopSequence();
        const newTrack = new SequencerTrack(insertPosition + 1, this.sequencerStore.numSteps);
        this.sequencerStore.tracks.splice(insertPosition + 1, 0, newTrack);
        this.updateTrackIds();
        this.triggerReactivityUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks + 1;
        this.instrumentManager.addInstrumentForTrack(insertPosition + 1);
    }

    /**
     * Removes a track from the sequencer at a specified position.
     * @param deletePosition The position from which to remove the track.
     */
    public removeTrack(deletePosition: number = this.sequencerStore.numTracks): void {
        this.playbackManager.stopSequence();
        this.sequencerStore.tracks.splice(deletePosition, 1);
        this.updateTrackIds();
        this.triggerReactivityUpdate();
        this.sequencerStore.numTracks = this.sequencerStore.numTracks - 1;
        this.instrumentManager.removeInstrumentForTrack(deletePosition);
    }

    /**
     * Sets the number of tracks in the sequencer.
     * @param newCount The new total number of tracks.
     */
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
        });
    }

    /**
     * Sets the number of steps for each track in the sequencer.
     * @param newCount The new total number of steps per track.
     */
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

    /**
     * Toggles the active state of a step in a track.
     * @param trackIndex The index of the track containing the step.
     * @param stepIndex The index of the step to toggle.
     */
    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        this.sequencerStore.tracks[trackIndex].steps[stepIndex].toggleStepActiveState();
    }
}
