// File: SequencerPlaybackManager.ts
// Description: Manages the playback of sequences within the sequencer, controlling transport and handling sequencing logic.

import * as Tone from 'tone';
import { InstrumentName, SequenceStatus } from '@/utils/types';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useStructureStore } from '@/stores/structureStore';
import { useTrackStore } from '@/stores/trackStore';
import { SetBpmCommand, SetTimeSignatureCommand } from './commands/SequencerCommands';
import { CommandManager } from './CommandManager';
import { useInstrumentStore } from '@/stores/instrumentStore';

export class SequencerPlaybackManager {
    private playbackStore = usePlaybackStore();
    private structureStore = useStructureStore();
    private instrumentStore = useInstrumentStore();
    private trackStore = useTrackStore();
    private lastManuallySelectedStep: number | null = null;
    public loopEnabled = false;
    private loop: Tone.Loop | null = null;
    private playbackStartTime: number | null = null;

    constructor(private commandManager: CommandManager) {
        this.initialize();
    }

    private initialize(): void {
        console.log('SequencerPlaybackManager initialized');
        this.playbackStore.state.status = SequenceStatus.Stopped;
        this.playbackStore.state.bpm = 120;
        Tone.getTransport().bpm.value = this.playbackStore.state.bpm;
        this.playbackStore.state.currentStep = 0;
        this.playbackStore.state.visualStep = 0;
    }


    public playSequence(): void {
        if (this.playbackStore.state.status === SequenceStatus.Playing) {
            return;
        }

        if (this.playbackStore.state.status === SequenceStatus.Paused) {
            this.resumeSequence();
            return;
        }

        this.playbackStore.state.status = SequenceStatus.Scheduled;

        const startStep = this.lastManuallySelectedStep ?? this.playbackStore.state.currentStep;

        Tone.getTransport().scheduleOnce(() => {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.playbackStore.state.stepDuration).toSeconds() * startStep);
            this.scheduleSequence();
            this.playbackStore.state.status = SequenceStatus.Playing;
        }, this.playbackStore.state.stepDuration);

        Tone.getTransport().start();
        this.lastManuallySelectedStep = null; // Reset after starting
    }

    public pauseSequence(): void {
        if (this.playbackStore.state.status !== SequenceStatus.Playing) return;

        this.playbackStore.state.status = SequenceStatus.Paused;
        Tone.getTransport().pause();
    }

    public stopSequence(): void {
        this.playbackStore.state.status = SequenceStatus.Stopped;
        Tone.getTransport().stop();
        this.clearScheduledEvents();
        this.resetPlaybackPosition();
        this.lastManuallySelectedStep = null; // Reset when stopping
    }

    public resumeSequence(): void {
        if (this.playbackStore.state.status !== SequenceStatus.Paused) return;

        this.playbackStore.state.status = SequenceStatus.Playing;
        this.playbackStartTime = Tone.now() - (Tone.Time(this.playbackStore.state.stepDuration).toSeconds() * this.playbackStore.state.currentStep);
        Tone.getTransport().start();
    }

    private clearScheduledEvents(): void {
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
    }

    private resetPlaybackPosition(): void {
        this.playbackStore.state.currentStep = 0;
        this.playbackStore.state.visualStep = 0;
    }

    private scheduleSequence(): void {
        this.clearScheduledEvents();

        this.loop = new Tone.Loop((time) => {
            const currentStepIndex = this.calculateCurrentStep(time);
            this.playCurrentStep(currentStepIndex, time);
            this.updateVisualStep(currentStepIndex);
            this.handleLooping(currentStepIndex);
        }, this.playbackStore.state.stepDuration);

        this.loop.start(0);
    }

    private calculateCurrentStep(time: number): number {
        const elapsedTime = time - (this.playbackStartTime ?? 0);
        const stepsElapsed = Math.floor(elapsedTime / Tone.Time(this.playbackStore.state.stepDuration).toSeconds());
        return stepsElapsed % this.structureStore.state.numSteps;
    }

    private playCurrentStep(stepIndex: number, time: number): void {
        this.trackStore.tracks.forEach((_, trackIndex) => {
            if (this.trackStore.getStepActive(trackIndex, stepIndex)) {

                if (this.instrumentStore.trackInstruments[trackIndex] === this.instrumentStore.instrumentPool[InstrumentName.NoiseSynth]) {
                    this.instrumentStore.trackInstruments[trackIndex].triggerAttackRelease(
                        this.playbackStore.state.stepDuration,
                        time,
                        this.trackStore.getTrackVelocity(trackIndex) ?? this.trackStore.getStepVelocity(trackIndex, stepIndex)
                    );
                } else {
                    this.instrumentStore.trackInstruments[trackIndex].triggerAttackRelease(
                        this.trackStore.getTrackNote(trackIndex) ?? this.trackStore.getStepNote(trackIndex, stepIndex),
                        this.playbackStore.state.stepDuration,
                        time,
                        this.trackStore.getTrackVelocity(trackIndex) ?? this.trackStore.getStepVelocity(trackIndex, stepIndex)
                    );
                }
            }
        });
    }

    private updateVisualStep(stepIndex: number): void {
        this.playbackStore.state.currentStep = stepIndex;
        this.playbackStore.state.visualStep = stepIndex;
    }

    private handleLooping(currentStepIndex: number): void {
        if (currentStepIndex >= this.structureStore.state.numSteps - 1) {
            if (this.loopEnabled) {
                this.playbackStartTime = Tone.now();
            } else {
                this.stopSequence();
            }
        }
    }


    public setStepDuration(duration: string): void {
        this.playbackStore.setStepDuration(duration);
        if (this.playbackStore.state.status === SequenceStatus.Playing) {
            this.stopSequence();
            this.playSequence();
        }
    }

    public seekTo(stepIndex: number): void {
        this.playbackStore.setCurrentStep(stepIndex);
        this.playbackStore.setVisualStep(stepIndex);
        if (this.playbackStore.state.status === SequenceStatus.Playing) {
            this.playbackStartTime = Tone.now() - (Tone.Time(this.playbackStore.state.stepDuration).toSeconds() * stepIndex);
        } else if (this.playbackStore.state.status === SequenceStatus.Stopped) {
            this.lastManuallySelectedStep = stepIndex;
        }
    }

    public getStatus(): SequenceStatus {
        return this.playbackStore.state.status
    }

    public setStatus(status: SequenceStatus): void {
        this.playbackStore.setStatus(status);
    }

    public getBpm(): number {
        return this.playbackStore.state.bpm;
    }

    public setBpm(newBpm: number): void {
        try {
            const command = new SetBpmCommand(newBpm);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting BPM:', error);
            throw error;
        }
    }

    public getTimeSignature(): [number, number] {
        return this.playbackStore.state.timeSignature;
    }

    public setTimeSignature(numerator: number, denominator: number): void {
        try {
            const command = new SetTimeSignatureCommand([numerator, denominator]);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting time signature:', error);
            throw error;
        }
    }
}
