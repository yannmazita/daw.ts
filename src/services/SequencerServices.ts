import * as Tone from 'tone';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { Instrument, InstrumentName } from '@/utils/types.ts';

export class SequencerService {
    private sequencerStore = useSequencerStore();
    private trackInstruments: Instrument[] = [];
    private instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public loopEnabled: boolean = false;
    private scheduleId: number | null = null;
    private lookAhead: number = 16;  // Number of steps to look ahead and schedule

    constructor() {
        Tone.getTransport().bpm.value = this.sequencerStore.bpm;
        this.initializeInstrumentPool();
    }

    private isPlaying(): boolean {
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
            if (this.isPlaying()) {
                this.checkAndRescheduleIfNeeded(stepIndex);
            }
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

    private scheduleSteps(startStep: number, count: number, startTime: number, stepDuration: number) {
        for (let i = 0; i < count; i++) {
            const stepIndex = (startStep + i) % this.sequencerStore.numSteps;
            this.sequencerStore.tracks.forEach((track, trackIndex) => {
                const step = track.steps[stepIndex];
                if (step.active) {
                    const delayIncrement = 0.1 / this.sequencerStore.tracks.length;
                    const offsetTime = startTime + i * stepDuration + trackIndex * delayIncrement;
                    this.trackInstruments[trackIndex].triggerAttackRelease("C2", stepDuration, offsetTime);

                    step.playing = true;
                    Tone.getDraw().schedule(() => {
                        step.playing = false;
                    }, offsetTime + stepDuration);
                }
            });
        }
    }

    private checkAndRescheduleIfNeeded(changedStepIndex: number) {
        if (!this.isPlaying()) { return; }

        const currentStep = Math.floor(Tone.getTransport().seconds / Tone.Time("16n").toSeconds()) % this.sequencerStore.numSteps;
        const endOfLookAhead = (currentStep + this.lookAhead) % this.sequencerStore.numSteps;
        // Check if changed step is outside the current lookahead window
        if ((currentStep <= endOfLookAhead && (changedStepIndex < currentStep || changedStepIndex > endOfLookAhead)) ||
            (currentStep > endOfLookAhead && (changedStepIndex < currentStep && changedStepIndex > endOfLookAhead))) {
            // Reschedule from current step
            this.updateSequence(currentStep);
        }
    }

    private updateSequence(startStep: number = 0) {
        if (this.scheduleId !== null) {
            Tone.getTransport().clear(this.scheduleId);
        }
        if (!this.isPlaying() && this.scheduleId !== null) {
            Tone.getTransport().clear(this.scheduleId);
            this.scheduleId = null; // Reset the schedule ID
            return; // Exit if not playing to avoid auto-starting the transport
        }

        const stepDuration = Tone.Time("16n").toSeconds();
        const scheduleAheadTime = stepDuration * this.lookAhead;

        this.scheduleId = Tone.getTransport().scheduleRepeat((time) => {
            const currentStep = Math.floor(Tone.getTransport().seconds / stepDuration) % this.sequencerStore.numSteps;
            this.scheduleSteps(currentStep, this.lookAhead, time, stepDuration);
        }, scheduleAheadTime, 0);

        this.scheduleSteps(startStep, this.lookAhead, Tone.getTransport().now(), stepDuration);
        Tone.getTransport().loopEnd = '1m';
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
