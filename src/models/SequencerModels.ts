import { Instrument } from "@/utils/types.ts";
import * as Tone from 'tone';

export class SequencerStep {
    public active: boolean;
    public playing: boolean;
    public instrument: Instrument;
    public note: string;

    constructor(
        active: boolean = false,
        playing: boolean = false,
        instrument: Instrument = new Tone.Synth().toDestination(),
        note: string = 'C2',
    ) {
        this.active = active;
        this.playing = playing;
        this.instrument = instrument
        this.note = note;
    }

    public toggleStepActiveState() {
        this.active = !this.active;
    }
}

export class SequencerTrack {
    public id: number;
    public steps: SequencerStep[];

    constructor(id: number, numSteps: number) {
        this.id = id;
        this.steps = Array.from({ length: numSteps }, () => new SequencerStep());
    }
}
