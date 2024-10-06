// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { InstrumentName } from '@/utils/types';
import { PlaybackState } from '@/utils/types';

/**
 * Manages playback operations for the sequencer, including play, pause, stop, and sequence scheduling.
 */
export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration = '16n';
    public loopEnabled = false;
    private loop: Tone.Loop | null = null;
    private playbackStartTime: number | null = null;
    private playbackState: PlaybackState = PlaybackState.Stopped;
    private timeSignature: [number, number] = [4, 4];

    constructor(private sequencerInstrumentManager: SequencerInstrumentManager) { }

    public playSequence(): void {
        if (this.playbackState === PlaybackState.Playing) {
            return;
        }

        if (this.playbackState === PlaybackState.Paused) {
            this.resumeSequence();
            return;
        }

        this.playbackState = PlaybackState.Scheduled;
        this.sequencerStore.isPlaying = true;

        Tone.getTransport().scheduleOnce(() => {
            this.playbackStartTime = Tone.now();
            this.scheduleSequence();
            this.playbackState = PlaybackState.Playing;
        }, this.stepDuration);

        Tone.getTransport().start();
    }

    public pauseSequence(): void {
        if (this.playbackState !== PlaybackState.Playing) return;

        this.playbackState = PlaybackState.Paused;
        this.sequencerStore.isPlaying = false;
        Tone.getTransport().pause();
    }

    public stopSequence(): void {
        this.playbackState = PlaybackState.Stopped;
        this.sequencerStore.isPlaying = false;
        Tone.getTransport().stop();
        this.clearScheduledEvents();
        this.resetPlaybackPosition();
    }

    public resumeSequence(): void {
        if (this.playbackState !== PlaybackState.Paused) return;

        this.playbackState = PlaybackState.Playing;
        this.sequencerStore.isPlaying = true;
        Tone.getTransport().start();
    }

    private clearScheduledEvents(): void {
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
    }

    private resetPlaybackPosition(): void {
        this.sequencerStore.currentStep = 0;
        this.sequencerStore.visualStep = 0;
    }

    private scheduleSequence(): void {
        this.clearScheduledEvents(); // Ensure any existing loop is cleared

        this.loop = new Tone.Loop((time) => {
            const currentStepIndex = this.calculateCurrentStep(time);
            this.playCurrentStep(currentStepIndex, time);
            this.updateVisualStep(currentStepIndex);
            this.handleLooping(currentStepIndex);
        }, this.stepDuration);

        this.loop.start(0);
    }

    private calculateCurrentStep(time: number): number {
        const elapsedTime = time - (this.playbackStartTime ?? 0);
        const stepsElapsed = Math.floor(elapsedTime / Tone.Time(this.stepDuration).toSeconds());
        return stepsElapsed % this.sequencerStore.numSteps;
    }

    private playCurrentStep(stepIndex: number, time: number): void {
        this.sequencerStore.tracks.forEach((track, trackIndex) => {
            if (track.steps[stepIndex].active && !track.muted) {
                const instrument = this.sequencerInstrumentManager.trackInstruments[trackIndex];
                const step = track.steps[stepIndex];

                if (this.sequencerInstrumentManager.trackInstruments[trackIndex] === this.sequencerInstrumentManager.instrumentPool[InstrumentName.NoiseSynth]) {
                    instrument.triggerAttackRelease(this.stepDuration, time, step.velocity);
                } else {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(step.note, this.stepDuration, time, step.velocity);
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
        if (this.playbackState === PlaybackState.Playing) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public seekTo(stepIndex: number): void {
        this.sequencerStore.currentStep = stepIndex;
        this.sequencerStore.visualStep = stepIndex;
        if (this.playbackState === PlaybackState.Playing) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public setTimeSignature(numerator: number, denominator: number): void {
        this.timeSignature = [numerator, denominator];
        Tone.getTransport().timeSignature = this.timeSignature;
    }

    public getPlaybackState(): PlaybackState {
        return this.playbackState;
    }
}
