// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerStep } from '@/models/SequencerModels';
import { InstrumentName } from '@/utils/types';

/**
 * Manages playback operations for the sequencer, including play, pause, stop, and sequence scheduling.
 */
export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration = '16n';
    public loopEnabled = false;
    private sequenceID: number | null = null;

    /**
     * Constructs the SequencerPlaybackManager.
     * @param sequencerInstrumentManager The instrument manager to interact with during playback.
     */
    constructor(private sequencerInstrumentManager: SequencerInstrumentManager) { }

    public playSequence(): void {
        if (this.sequencerStore.isPlaying) {
            this.stopSequence();
        }
        this.sequencerStore.isPlaying = true;
        //this.sequencerInstrumentManager.initializeTrackInstruments(this.sequencerStore.tracks);
        this.scheduleSequence();
        Tone.getTransport().start();
    }

    public pauseSequence(): void {
        if (!this.sequencerStore.isPlaying) {
            return;
        }
        else if (this.sequenceID) {
            Tone.getTransport().clear(this.sequenceID);
        }
        this.sequencerStore.isPlaying = false;
        Tone.getTransport().pause();
    }

    public stopSequence(): void {
        this.sequencerStore.isPlaying = false;
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        if (this.sequenceID) {
            Tone.getTransport().clear(this.sequenceID);
        }
        this.sequencerStore.currentStep = 0;
    }

    /**
     * Schedules the sequence for playback using Tone.js' Transport.
     */
    private scheduleSequence(): void {
        this.sequenceID = Tone.getTransport().scheduleRepeat(time => {
            if (this.sequencerStore.currentStep < this.sequencerStore.numSteps) {
                this.sequencerStore.tracks.forEach((track, trackIndex) => {
                    const step: SequencerStep = track.steps[this.sequencerStore.currentStep];
                    if (step.active) {
                        if (this.sequencerInstrumentManager.trackInstruments[trackIndex] === this.sequencerInstrumentManager.instrumentPool[InstrumentName.NoiseSynth]) {
                            this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(this.stepDuration, time);
                        }
                        else {
                            this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(step.note, this.stepDuration, time);
                        }
                    }
                });

                // Advance the current step or handle the end of the sequence
                if (this.loopEnabled || this.sequencerStore.currentStep + 1 < this.sequencerStore.numSteps) {
                    this.sequencerStore.currentStep = (this.sequencerStore.currentStep + 1) % this.sequencerStore.numSteps;
                } else {
                    // Stop the sequence if looping is not enabled and we're at the last step
                    this.sequencerStore.currentStep++;  // Increment to potentially go beyond numSteps to naturally stop
                    if (this.sequencerStore.currentStep >= this.sequencerStore.numSteps) {
                        this.stopSequence();
                    }
                }
            } else {
                this.stopSequence();
            }
        }, this.stepDuration);
    }

    /**
     * Sets the beats per minute (BPM) for the sequence playback.
     * @param newBpm The new BPM value to set.
     */
    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
        this.sequencerStore.bpm = newBpm;
    }
}
