// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore';
import { InstrumentName, SequenceStatus } from '@/utils/types';
import { SequencerInstrumentManager } from './SequencerInstrumentManager';

export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration = '16n';
    private lastManuallySelectedStep: number | null = null;
    public loopEnabled = false;
    private loop: Tone.Loop | null = null;
    private playbackStartTime: number | null = null;
    private timeSignature: [number, number] = [4, 4];

    constructor(private sequencerInstrumentManager: SequencerInstrumentManager) {
        this.initialize();
    }

    private initialize(): void {
        console.log('SequencerPlaybackManager initialized');
        this.sequencerStore.playback.status = SequenceStatus.Stopped;
        this.sequencerStore.playback.bpm = 120;
        Tone.getTransport().bpm.value = this.sequencerStore.playback.bpm;
        this.sequencerStore.playback.currentStep = 0;
        this.sequencerStore.playback.visualStep = 0;
    }


    public playSequence(): void {
        if (this.sequencerStore.playback.status === SequenceStatus.Playing) {
            return;
        }

        if (this.sequencerStore.playback.status === SequenceStatus.Paused) {
            this.resumeSequence();
            return;
        }

        this.sequencerStore.playback.status = SequenceStatus.Scheduled;

        const startStep = this.lastManuallySelectedStep ?? this.sequencerStore.playback.currentStep;

        Tone.getTransport().scheduleOnce(() => {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.stepDuration).toSeconds() * startStep);
            this.scheduleSequence();
            this.sequencerStore.playback.status = SequenceStatus.Playing;
        }, this.stepDuration);

        Tone.getTransport().start();
        this.lastManuallySelectedStep = null; // Reset after starting
    }

    public pauseSequence(): void {
        if (this.sequencerStore.playback.status !== SequenceStatus.Playing) return;

        this.sequencerStore.playback.status = SequenceStatus.Paused;
        Tone.getTransport().pause();
    }

    public stopSequence(): void {
        this.sequencerStore.playback.status = SequenceStatus.Stopped;
        Tone.getTransport().stop();
        this.clearScheduledEvents();
        this.resetPlaybackPosition();
        this.lastManuallySelectedStep = null; // Reset when stopping
    }

    public resumeSequence(): void {
        if (this.sequencerStore.playback.status !== SequenceStatus.Paused) return;

        this.sequencerStore.playback.status = SequenceStatus.Playing;
        this.playbackStartTime = Tone.now() - (Tone.Time(this.stepDuration).toSeconds() * this.sequencerStore.playback.currentStep);
        Tone.getTransport().start();
    }

    private clearScheduledEvents(): void {
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
    }

    private resetPlaybackPosition(): void {
        this.sequencerStore.playback.currentStep = 0;
        this.sequencerStore.playback.visualStep = 0;
    }

    private scheduleSequence(): void {
        this.clearScheduledEvents();

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
        return stepsElapsed % this.sequencerStore.structure.numSteps;
    }

    private playCurrentStep(stepIndex: number, time: number): void {
        this.sequencerStore.structure.tracks.forEach((track, trackIndex) => {
            if (track.steps[stepIndex].active && !track.effectiveMute) {
                const step = track.steps[stepIndex];

                if (this.sequencerInstrumentManager.trackInstruments[trackIndex] === this.sequencerInstrumentManager.instrumentPool[InstrumentName.NoiseSynth]) {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(
                        this.stepDuration,
                        time,
                        track.commonVelocity ?? step.velocity
                    );
                } else {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(
                        track.commonNote ?? step.note,
                        this.stepDuration,
                        time,
                        track.commonVelocity ?? step.velocity
                    );
                }
            }
        });
    }

    private updateVisualStep(stepIndex: number): void {
        this.sequencerStore.playback.currentStep = stepIndex;
        this.sequencerStore.playback.visualStep = stepIndex;
    }

    private handleLooping(currentStepIndex: number): void {
        if (currentStepIndex >= this.sequencerStore.structure.numSteps - 1) {
            if (this.loopEnabled) {
                this.playbackStartTime = Tone.now();
            } else {
                this.stopSequence();
            }
        }
    }

    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
        this.sequencerStore.playback.bpm = newBpm;
    }

    public setStepDuration(duration: string): void {
        this.stepDuration = duration;
        if (this.sequencerStore.playback.status === SequenceStatus.Playing) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public seekTo(stepIndex: number): void {
        this.sequencerStore.playback.currentStep = stepIndex;
        this.sequencerStore.playback.visualStep = stepIndex;
        if (this.sequencerStore.playback.status === SequenceStatus.Playing) {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.stepDuration).toSeconds() * stepIndex);
        } else if (this.sequencerStore.playback.status === SequenceStatus.Stopped) {
            this.lastManuallySelectedStep = stepIndex;
        }
    }

    public setTimeSignature(numerator: number, denominator: number): void {
        this.timeSignature = [numerator, denominator];
        Tone.getTransport().timeSignature = this.timeSignature;
    }
}
