// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore';
import { InstrumentName } from '@/utils/types';
import { CommandManager } from './CommandManager';
import { SetBpmCommand, SetTimeSignatureCommand } from './commands/SequencerCommands';

export enum PlayStatus {
    Stopped,
    Playing,
    Paused,
    Scheduled
}

export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration = '16n';
    private lastManuallySelectedStep: number | null = null;
    public loopEnabled = false;
    private loop: Tone.Loop | null = null;
    private playbackStartTime: number | null = null;
    private playStatus: PlayStatus = PlayStatus.Stopped;

    constructor(private commandManager: CommandManager) { }

    public playSequence(): void {
        if (this.playStatus === PlayStatus.Playing) {
            return;
        }

        if (this.playStatus === PlayStatus.Paused) {
            this.resumeSequence();
            return;
        }

        this.playStatus = PlayStatus.Scheduled;
        this.sequencerStore.playback.isPlaying = true;

        const startStep = this.lastManuallySelectedStep ?? this.sequencerStore.playback.currentStep;

        Tone.getTransport().scheduleOnce(() => {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.stepDuration).toSeconds() * startStep);
            this.scheduleSequence();
            this.playStatus = PlayStatus.Playing;
        }, this.stepDuration);

        Tone.getTransport().start();
        this.lastManuallySelectedStep = null; // Reset after starting
    }

    public pauseSequence(): void {
        if (this.playStatus !== PlayStatus.Playing) return;

        this.playStatus = PlayStatus.Paused;
        this.sequencerStore.playback.isPlaying = false;
        Tone.getTransport().pause();
    }

    public stopSequence(): void {
        this.playStatus = PlayStatus.Stopped;
        this.sequencerStore.playback.isPlaying = false;
        Tone.getTransport().stop();
        this.clearScheduledEvents();
        this.resetPlaybackPosition();
        this.lastManuallySelectedStep = null; // Reset when stopping
    }

    public resumeSequence(): void {
        if (this.playStatus !== PlayStatus.Paused) return;

        this.playStatus = PlayStatus.Playing;
        this.sequencerStore.playback.isPlaying = true;
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
        this.sequencerStore.structure.tracks.forEach(track => {
            if (track.steps[stepIndex].active && !track.effectiveMute) {
                const step = track.steps[stepIndex];

                if (track.instrument.name === InstrumentName.NoiseSynth.valueOf()) {
                    track.instrument.triggerAttackRelease(this.stepDuration, time, step.velocity);
                } else {
                    track.instrument.triggerAttackRelease(step.note, this.stepDuration, time, step.velocity);
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
        const command = new SetBpmCommand(newBpm);
        this.commandManager.execute(command);
    }

    public setStepDuration(duration: string): void {
        this.stepDuration = duration;
        if (this.playStatus === PlayStatus.Playing) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public seekTo(stepIndex: number): void {
        this.sequencerStore.playback.currentStep = stepIndex;
        this.sequencerStore.playback.visualStep = stepIndex;
        if (this.playStatus === PlayStatus.Playing) {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.stepDuration).toSeconds() * stepIndex);
        } else if (this.playStatus === PlayStatus.Stopped) {
            this.lastManuallySelectedStep = stepIndex;
        }
    }

    public setTimeSignature(numerator: number, denominator: number): void {
        const command = new SetTimeSignatureCommand([numerator, denominator]);
        this.commandManager.execute(command);
    }
}
