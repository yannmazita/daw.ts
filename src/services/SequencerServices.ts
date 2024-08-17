import * as Tone from 'tone';
import { ref, Ref } from 'vue';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { Instrument, InstrumentName } from '@/utils/types.ts';
import { SequencerStep, SequencerTrack } from '@/models/SequencerModels';

export class SequencerService {
    private sequencerStore = useSequencerStore();
    public tracks: Ref<SequencerTrack[]> = ref([]);
    private trackInstruments: Instrument[] = [];
    private instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public loopEnabled: boolean = false;
    //private lookAhead: number = 16;  // Number of steps to look ahead and schedule
    private stepDuration: string = '16n';

    constructor() {
        Tone.getTransport().bpm.value = this.sequencerStore.bpm;
        this.initializeTracks();
        this.initializeInstrumentPool();
    }

    public isPlaying(): boolean {
        return Tone.getTransport().state === 'started';
    }

    private createInstrument(instrumentName: InstrumentName): Instrument {
        switch (instrumentName) {
            case InstrumentName.AMSynth:
                return new Tone.AMSynth().toDestination();
            case InstrumentName.FMSynth:
                return new Tone.FMSynth().toDestination();
            case InstrumentName.MembraneSynth:
                return new Tone.MembraneSynth().toDestination();
            case InstrumentName.MetalSynth:
                return new Tone.MetalSynth().toDestination();
            case InstrumentName.MonoSynth:
                return new Tone.MonoSynth().toDestination();
            case InstrumentName.NoiseSynth:
                return new Tone.NoiseSynth().toDestination();
            case InstrumentName.Synth:
            default:
                return new Tone.Synth().toDestination();
        }
    }

    private initializeTracks(): void {
        this.tracks.value = Array.from({ length: this.sequencerStore.numTracks }, (_, i) => new SequencerTrack(i, this.sequencerStore.numSteps));
    }

    private initializeInstrumentPool(): void {
        Object.values(InstrumentName).forEach(name => {
            this.instrumentPool[name] = this.createInstrument(name);
        });
    }

    private initializeTrackInstruments(): void {
        this.trackInstruments = this.tracks.value.map(() => this.instrumentPool[InstrumentName.Synth]);
    }

    public setInstrumentForTrack(trackIndex: number, instrumentName: InstrumentName) {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            this.trackInstruments[trackIndex] = this.instrumentPool[instrumentName];
        }
    }

    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        this.tracks.value[trackIndex].steps[stepIndex].toggleStepActiveState();
    }

    public toggleLoop(): void {
        this.loopEnabled = !this.loopEnabled;
    }

    public addTrack(): void {
        this.stopSequence();
        const newTrack = new SequencerTrack(this.tracks.value.length, this.sequencerStore.numSteps);
        this.tracks.value.push(newTrack);
        this.sequencerStore.numTracks++;
    }

    public setNumTracks(newCount: number) {
        this.stopSequence();
        if (newCount < this.tracks.value.length) {
            this.tracks.value = this.tracks.value.slice(0, newCount);
        } else {
            const newTracks = Array.from({ length: newCount - this.tracks.value.length }, (_, i) =>
                new SequencerTrack(this.tracks.value.length + i, this.sequencerStore.numSteps)
            );
            this.tracks.value = [...this.tracks.value, ...newTracks];
        }
        this.sequencerStore.numTracks = newCount;
    }

    public setNumSteps(newCount: number) {
        this.stopSequence();
        this.tracks.value.forEach(track => {
            if (newCount < track.steps.length) {
                track.steps.splice(newCount);
            } else {
                for (let i = track.steps.length; i < newCount; i++) {
                    track.steps.push(new SequencerStep());
                }
            }
        });
        this.sequencerStore.numSteps = newCount;
    }

    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
        this.sequencerStore.bpm = newBpm;
    }

    private scheduleSequence(): void {
        Tone.getTransport().scheduleRepeat(time => {
            this.tracks.value.forEach((track, trackIndex) => {
                const step: SequencerStep = track.steps[this.sequencerStore.currentStep];
                if (step.active) {
                    this.trackInstruments[trackIndex].triggerAttackRelease(step.note, this.stepDuration, time);

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

    public playSequence(): void {
        this.stopSequence();
        this.initializeTrackInstruments();
        this.scheduleSequence();
        Tone.getTransport().start();
    }

    public stopSequence(): void {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        this.sequencerStore.currentStep = 0;
        this.tracks.value.forEach(track => {
            track.steps.forEach(step => {
                step.playing = false;
            });
        })
    }
}
