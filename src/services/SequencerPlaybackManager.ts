// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { InstrumentName } from '@/utils/types';

/**
 * Manages playback operations for the sequencer, including play, pause, stop, and sequence scheduling.
 */
export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration = '16n';
    /*
    private tracks = this.sequencerStore.tracks;
    private numSteps = this.sequencerStore.numSteps;
    private currentStep = this.sequencerStore.currentStep;
    private visualStep = this.sequencerStore.visualStep;
    */
    public loopEnabled = false;
    private sequenceID: number | null = null;
    private playbackStartTime: number | null = null;

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
        this.playbackStartTime = Tone.now();
        this.scheduleSequence();
        Tone.getTransport().start();
    }

    public pauseSequence(): void {
        if (!this.sequencerStore.isPlaying) return;

        this.sequencerStore.isPlaying = false;
        Tone.getTransport().pause();
        this.clearScheduledEvents();
    }

    public stopSequence(): void {
        this.sequencerStore.isPlaying = false;
        Tone.getTransport().stop();
        this.clearScheduledEvents();
        this.resetPlaybackPosition();
    }

    private clearScheduledEvents(): void {
        if (this.sequenceID !== null) {
            Tone.getTransport().clear(this.sequenceID);
            this.sequenceID = null;
        }
    }

    private resetPlaybackPosition(): void {
        this.sequencerStore.currentStep = 0;
        this.sequencerStore.visualStep = 0;
    }

    private scheduleSequence(): void {
        this.sequenceID = Tone.getTransport().scheduleRepeat((time) => {
            const currentStepIndex = this.calculateCurrentStep(time);
            this.playCurrentStep(currentStepIndex, time);
            this.updateVisualStep(currentStepIndex);
            this.handleLooping(currentStepIndex);
        }, this.stepDuration);
    }

    private calculateCurrentStep(time: number): number {
        const elapsedTime = time - (this.playbackStartTime ?? 0);
        const stepsElapsed = Math.floor(elapsedTime / Tone.Time(this.stepDuration).toSeconds());
        return stepsElapsed % this.sequencerStore.numSteps;
    }

    private playCurrentStep(stepIndex: number, time: number): void {
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.steps[stepIndex].active) {
                if (this.sequencerInstrumentManager.trackInstruments[trackIndex] === this.sequencerInstrumentManager.instrumentPool[InstrumentName.NoiseSynth]) {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(this.stepDuration, time, track.steps[stepIndex].velocity);
                } else {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(track.steps[stepIndex].note, this.stepDuration, time, track.steps[stepIndex].velocity);
                }
            }
        });
    }

    private updateVisualStep(stepIndex: number): void {
        this.sequencerStore.currentStep = stepIndex;
        this.sequencerStore.visualStep = stepIndex;
    }

    private handleLooping(currentStepIndex: number): void {
        if (currentStepIndex >= this.sequencerStore.numSteps - 1) {
            if (this.loopEnabled) {
                this.resetPlaybackPosition();
            } else {
                this.stopSequence();
            }
        }
    }

    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
        this.sequencerStore.bpm = newBpm;
    }

    public setStepDuration(duration: string): void {
        this.stepDuration = duration;
        if (this.sequencerStore.isPlaying) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public seekTo(stepIndex: number): void {
        this.sequencerStore.currentStep = stepIndex;
        this.sequencerStore.visualStep = stepIndex;
        if (this.sequencerStore.isPlaying) {
            this.stopSequence();
            this.playSequence();
        }
    }
}
