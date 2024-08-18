import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";

export class AddTrackCommand implements Command {
    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        this.trackManager.addTrack();
    }
    undo() { }
    redo() { }
}

export class AddTrackRelativeCommand implements Command {
    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        this.trackManager.addTrack();
    }
    undo() { }
    redo() { }
}

export class RemoveTrackCommand implements Command {
    constructor(private trackManager: SequencerTrackManager) { }
    execute() { }
    undo() { }
    redo() { }
}

export class RemoveLastTrackCommand implements Command {
    constructor(private trackManager: SequencerTrackManager) { }
    execute() { }
    undo() { }
    redo() { }
}

export class ClearTracksCommand implements Command {
    constructor(private trackManager: SequencerTrackManager) { }
    execute() { }
    undo() { }
    redo() { }
}

export class AddStepCommand implements Command {
    constructor() { }
    execute() { }
    undo() { }
    redo() { }
}

export class RemoveStepCommand implements Command {
    constructor() { }
    execute() { }
    undo() { }
    redo() { }
}

export class RemoveLastStepCommand implements Command {
    constructor() { }
    execute() { }
    undo() { }
    redo() { }
}
