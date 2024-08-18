import * as Tone from 'tone';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerStep } from '@/models/SequencerModels';

export class SequencerPlaybackManager {
    private sequencerStore = useSequencerStore();
    private stepDuration: string = '16n';
    public loopEnabled: boolean = false;

    constructor(private sequencerTrackManager: SequencerTrackManager, private sequencerInstrumentManager: SequencerInstrumentManager) { }

    public playSequence(): void {
        this.stopSequence();
        this.sequencerInstrumentManager.initializeTrackInstruments(this.sequencerTrackManager.tracks.value);
        this.scheduleSequence();
        Tone.getTransport().start();
    }

    public stopSequence(): void {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        this.sequencerStore.currentStep = 0;
        this.sequencerTrackManager.tracks.value.forEach(track => {
            track.steps.forEach(step => {
                step.playing = false;
            });
        })
    }

    private scheduleSequence(): void {
        Tone.getTransport().scheduleRepeat(time => {
            this.sequencerTrackManager.tracks.value.forEach((track, trackIndex) => {
                const step: SequencerStep = track.steps[this.sequencerStore.currentStep];
                if (step.active) {
                    this.sequencerInstrumentManager.trackInstruments[trackIndex].triggerAttackRelease(step.note, this.stepDuration, time);

                    step.playing = true;
                    Tone.getDraw().schedule(() => {
                        step.playing = false;
                    }, time + this.stepDuration);
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
