export interface Command {
    execute(): void;
    undo(): void;
    redo(): void;
}

export interface StepPosition {
    trackIndex: number | null;
    stepIndex: number | null;
}
