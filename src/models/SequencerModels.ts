export class SequencerStep {
    public active: boolean;
    public playing: boolean;
    public note: string;

    constructor(
        active: boolean = false,
        playing: boolean = false,
        note: string = 'C2',
    ) {
        this.active = active;
        this.playing = playing;
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
