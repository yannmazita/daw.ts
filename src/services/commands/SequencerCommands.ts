import { useSequencerStore } from "@/stores/sequencerStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";

export class AddTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private trackManager: SequencerTrackManager, private upOrDown: string = "down") { }
    execute() {
        if (this.sequencerStore.rightClickTrackIndex) {
            this.trackManager.addTracks(this.sequencerStore.rightClickTrackIndex, this.upOrDown);
        }
        else {
            this.trackManager.addTracks();
        }
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
