// File: SequencerModels.ts
// Description: Defines the core data models used in the sequencer, including step and track configurations.

import * as Tone from 'tone';
import { Instrument, InstrumentName, Note } from "@/utils/types";

/**
 * Represents a single step in a sequencer track.
 */
export class SequencerStep {
    /**
     * Creates an instance of a sequencer step.
     */
    constructor(
        public active = false,
        public note: Note = Note.C4,
        private _velocity = 1,
        //public modulation = 0,
    ) {
        this.active = active;
        this.note = note;
    }

    public get velocity() {
        return this._velocity;
    }
    public set velocity(value) {
        this._velocity = Math.min(127, Math.max(0, value)); // 127 is the MIDI standard for max velocity
    }

    /**
     * Toggles the active state of the step. If the step was active, it becomes inactive and vice versa.
     */
    public toggleStepActiveState() {
        this.active = !this.active;
    }
}

/**
 * Represents a track in the sequencer, which consists of multiple steps.
 */
export class SequencerTrack {
    public id: number;
    public steps: SequencerStep[];
    public muted = false;
    public solo = false;
    public effectiveMute = false;
    public instrument: Instrument;

    constructor(id: number, numSteps: number, instrumentName: InstrumentName = InstrumentName.Synth) {
        this.id = id;
        this.steps = Array.from({ length: numSteps }, () => new SequencerStep());
        this.instrument = this.createInstrument(instrumentName);
    }

    private createInstrument(instrumentName: InstrumentName): Instrument {
        console.log('Creating instrument:', instrumentName);
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

    public setInstrument(instrumentName: InstrumentName): void {
        this.instrument.dispose();
        this.instrument = this.createInstrument(instrumentName);
    }

    public dispose(): void {
        this.instrument.dispose();
    }

    public setNumSteps(newCount: number): void {
        if (newCount < 1) return;
        if (newCount > this.steps.length) {
            this.steps = this.steps.concat(Array.from({ length: newCount - this.steps.length }, () => new SequencerStep()));
        } else {
            this.steps = this.steps.slice(0, newCount);
        }
    }
}
