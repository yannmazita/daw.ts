export class SequencerStep {
    constructor(public active = false, public note = 'C2') {
        this.active = active;
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
