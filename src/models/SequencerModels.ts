// File: SequencerModels.ts
// Description: Defines the core data models used in the sequencer, including step and track configurations.

/**
 * Represents a single step in a sequencer track.
 */
export class SequencerStep {
    /**
     * Creates an instance of a sequencer step.
     * @param active - Indicates whether the step is active (note will play).
     * @param note - The musical note associated with the step.
     */
    constructor(public active = false, public note = 'C2') {
        this.active = active;
        this.note = note;
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

    /**
     * Creates an instance of a sequencer track.
     * @param id - The unique identifier for the track.
     * @param numSteps - The number of steps to initialize in the track.
     */
    constructor(id: number, numSteps: number) {
        this.id = id;
        this.steps = Array.from({ length: numSteps }, () => new SequencerStep());
    }
}
