import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { Instrument, InstrumentName } from '@/utils/types.ts';

export class SequencerService {
    private sequencerStore = useSequencerStore();
    private trackInstruments: Instrument[] = [];
    private instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public loopEnabled: boolean = false;
    private sequence: Tone.Sequence<any> | null = null;

    constructor() {
        Tone.getTransport().bpm.value = this.sequencerStore.bpm;
        this.initializeInstrumentPool();
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

    private initializeInstrumentPool() {
        Object.values(InstrumentName).forEach(name => {
            this.instrumentPool[name] = this.createInstrument(name);
        });
    }

    private initializeTrackInstruments() {
        this.trackInstruments = this.sequencerStore.tracks.map(() => this.instrumentPool[InstrumentName.Synth]);
    }

    public setInstrumentForTrack(trackIndex: number, instrumentName: InstrumentName) {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            this.trackInstruments[trackIndex] = this.instrumentPool[instrumentName];
        }
    }

    public refreshTracks(newTrackCount: number) {
        if (newTrackCount > this.sequencerStore.tracks.length) {
            for (let i = this.sequencerStore.tracks.length; i < newTrackCount; i++) {
                this.sequencerStore.addTrack(i);
            }
        } else if (newTrackCount < this.sequencerStore.tracks.length) {
            this.sequencerStore.removeTracks(newTrackCount);
        }
    }

    public toggleStepActiveState(trackId: number, stepIndex: number) {
        const track = this.sequencerStore.tracks.find(t => t.id === trackId);
        if (track) {
            track.steps[stepIndex].toggleStepActiveState();
        }
    };

    public toggleLoop() {
        this.loopEnabled = !this.loopEnabled;
        if (this.sequence) {
            this.sequence.loop = this.loopEnabled;
        }
        console.log(`loopEnabled = ${this.loopEnabled}`);
    }

    public setNumSteps(numSteps: number) {
        this.stopSequence();
        this.sequencerStore.numSteps = numSteps;
        this.updateSequence();
    }

    public setNumTracks(numTracks: number) {
        this.stopSequence();
        this.sequencerStore.numTracks = numTracks;
        this.updateSequence();
    }

    public setBpm(bpm: number) {
        this.sequencerStore.bpm = bpm;
        Tone.getTransport().bpm.value = bpm;
    }

    private updateSequence() {
        if (this.sequence) {
            this.sequence.dispose();
        }

        const noteDuration = "16n";
        const events: ((time: number) => void)[] = [];

        // Create an event for each step
        for (let step = 0; step < this.sequencerStore.numSteps; step++) {
            events.push((time: number) => {
                // Handle each track for this step
                this.sequencerStore.tracks.forEach((track, trackIndex) => {
                    const currentStep = track.steps[step];
                    if (currentStep.active) {
                        // Trigger the instrument
                        this.trackInstruments[trackIndex].triggerAttackRelease("C2", noteDuration, time);

                        currentStep.playing = true;

                        // Schedule setting playing state back to false
                        Tone.getDraw().schedule(() => {
                            currentStep.playing = false;
                        }, time + Tone.Time(noteDuration).toSeconds());
                    }
                });

                // Update the current step in the store
                this.sequencerStore.currentStep = step;
            });
        }

        this.sequence = new Tone.Sequence(
            (time, step) => {
                events[step](time);
            },
            [...Array(this.sequencerStore.numSteps).keys()], noteDuration).start(0);

        this.sequence.loop = this.loopEnabled;
    }

    public playSequence() {
        this.stopSequence();
        this.initializeTrackInstruments();
        this.updateSequence();
        Tone.getTransport().start();
    }

    public stopSequence() {
        Tone.getTransport().stop();
        if (this.sequence) {
            this.sequence.stop();
        }
        this.sequencerStore.currentStep = 0;
    }

    public dispose() {
        if (this.sequence) {
            this.sequence.dispose();
        }
        Object.values(this.instrumentPool).forEach(instrument => instrument.dispose());
        this.instrumentPool = {} as Record<InstrumentName, Instrument>;
        this.trackInstruments = [];
    }
}
