import { useSequencerStore } from "@/stores/sequencerStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";

export class AddTrackCommand implements Command {
    constructor(private trackManager: SequencerTrackManager, private relative: boolean = false) { }
    execute() {
        const store = useSequencerStore();
        if (this.relative && store.rightClickTrackIndex) {
            this.trackManager.addTrack(store.rightClickTrackIndex + 1);
        }
        else {
            this.trackManager.addTrack();
        }
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
