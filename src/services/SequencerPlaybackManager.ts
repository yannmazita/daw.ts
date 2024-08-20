import * as Tone from 'tone';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerStep } from '@/models/SequencerModels';

export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration: string = '16n';
    public loopEnabled: boolean = false;
    private sequenceID: number | null = null;

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

    private scheduleSequence(): void {
        this.sequenceID = Tone.getTransport().scheduleRepeat(time => {
            this.sequencerStore.tracks.forEach((track, trackIndex) => {
                const step: SequencerStep = track.steps[this.sequencerStore.currentStep];
                if (step.active) {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(step.note, this.stepDuration, time);
                }
            });

            if (this.loopEnabled || this.sequencerStore.currentStep + 1 < this.sequencerStore.numSteps) {
                this.sequencerStore.currentStep = (this.sequencerStore.currentStep + 1) % this.sequencerStore.numSteps;
            } else {
                this.stopSequence();
            }
        }, this.stepDuration);
    }

    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
        this.sequencerStore.bpm = newBpm;
    }
}
