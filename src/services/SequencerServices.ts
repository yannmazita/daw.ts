import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { Instrument, InstrumentName } from '@/utils/types.ts';

export class SequencerService {
    private sequencerStore = useSequencerStore();
    private trackInstruments: Instrument[] = [];
    private instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public loopEnabled: boolean = false;
    private scheduleId: number | null = null;

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

    public toggleStepActiveState(trackId: number, stepIndex: number) {
        const track = this.sequencerStore.tracks.find(t => t.id === trackId);
        if (track) {
            track.steps[stepIndex].toggleStepActiveState();
        }
    };

    public toggleLoop() {
        this.loopEnabled = !this.loopEnabled;
        Tone.getTransport().loop = this.loopEnabled;
        console.log(`loopEnabled = ${this.loopEnabled}`);
    }

    public setNumSteps(numSteps: number) {
        this.stopSequence();
        this.sequencerStore.adjustStepCount(numSteps);
        this.updateSequence();
        console.log(`sequence updated with ${numSteps} steps`);
    }

    public setNumTracks(numTracks: number) {
        this.stopSequence();
        this.sequencerStore.numTracks = numTracks;
        this.sequencerStore.adjustTrackCount(numTracks);
        this.updateSequence();
        console.log(`sequence updated with ${numTracks} tracks`);
    }

    public setBpm(bpm: number) {
        this.sequencerStore.bpm = bpm;
        Tone.getTransport().bpm.value = bpm;
    }

    private updateSequence() {
        if (this.scheduleId !== null) {
            Tone.getTransport().clear(this.scheduleId);
        }

        const stepDuration = Tone.Time("16n").toSeconds();
        const totalDuration = stepDuration * this.sequencerStore.numSteps;

        this.scheduleId = Tone.getTransport().scheduleRepeat((time) => {
            const currentStep = Math.floor(Tone.getTransport().seconds / stepDuration) % this.sequencerStore.numSteps;

            this.sequencerStore.tracks.forEach((track, trackIndex) => {
                const step = track.steps[currentStep];
                if (step.active) {
                    // Overlapping trigger times induce errors. A delay between triggers of different tracks to avoid this.
                    //const offsetTime = time + (trackIndex * 0.01); // Small offset to avoid simultaneous triggers
                    const delayIncrement = 0.1 / this.sequencerStore.tracks.length; // Smaller fraction based on number of tracks
                    const offsetTime = time + trackIndex * delayIncrement;  // Apply minimal adaptive delay
                    this.trackInstruments[trackIndex].triggerAttackRelease("C2", stepDuration, offsetTime);

                    step.playing = true;
                    Tone.getDraw().schedule(() => {
                        step.playing = false;
                    }, offsetTime + stepDuration);
                }
            });

            this.sequencerStore.currentStep = currentStep;
        }, stepDuration, 0, totalDuration);

        Tone.getTransport().loopEnd = totalDuration;
        Tone.getTransport().loop = this.loopEnabled;
    }

    public playSequence() {
        this.stopSequence();
        this.initializeTrackInstruments();
        this.updateSequence();
        Tone.getTransport().start();
    }

    public stopSequence() {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        this.sequencerStore.currentStep = 0;
        this.sequencerStore.tracks.forEach(track => {
            track.steps.forEach(step => {
                step.playing = false;
            });
        });
    }
}
