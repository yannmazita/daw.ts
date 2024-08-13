import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { Instrument, InstrumentName } from '@/utils/types.ts';

export class SequencerService {
    private sequencerStore = useSequencerStore();
    //private instruments: Instrument[] = [];
    private trackInstruments: Instrument[] = [];
    private instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public loopEnabled: boolean = false;

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
        console.log(`loopEnabled = ${this.loopEnabled}`);
    }

    public setNumSteps(numSteps: number) {
        this.stopSequence();
        this.sequencerStore.numSteps = numSteps;
    }

    public setNumTracks(numTracks: number) {
        this.stopSequence();
        this.sequencerStore.numTracks = numTracks;
    }

    public setBpm(bpm: number) {
        this.sequencerStore.bpm = bpm;
        Tone.getTransport().bpm.value = bpm;
    }

    public playSequence() {
        this.stopSequence();
        this.initializeTrackInstruments();
        Tone.getTransport().cancel();  // Clear existing events

        const playStep = (time: number) => {
            this.sequencerStore.tracks.forEach((track, trackIndex) => {
                const step = track.steps[this.sequencerStore.currentStep];
                if (step.active) {
                    this.trackInstruments[trackIndex].triggerAttackRelease("C2", "8n", time);
                    step.playing = true;
                    Tone.getDraw().schedule(() => {
                        step.playing = false;
                    }, time + Tone.Time("8n").toSeconds());
                }
            });

            this.sequencerStore.currentStep = (this.sequencerStore.currentStep + 1) % this.sequencerStore.numSteps;

            if (this.loopEnabled || this.sequencerStore.currentStep !== 0) {
                Tone.getTransport().schedule(playStep, `+8n`);
            } else {
                Tone.getTransport().schedule(this.stopSequence.bind(this), `+8n`);
            }
        };
        Tone.getTransport().schedule(playStep, 0);
        Tone.getTransport().start();
    }

    public stopSequence() {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        this.sequencerStore.currentStep = 0;
    }

    public dispose() {
        Object.values(this.instrumentPool).forEach(instrument => instrument.dispose());
        this.instrumentPool = {} as Record<InstrumentName, Instrument>;
        this.trackInstruments = [];
    }
}
