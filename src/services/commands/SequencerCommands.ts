import { useSequencerStore } from "@/stores/sequencerStore";
import { useUIStore } from "@/stores/uiStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";

export class AddTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        if (this.sequencerStore.rightClickTrackPos) {
            this.trackManager.addTrack(this.sequencerStore.rightClickTrackPos);
        }
    }
    undo() { }
    redo() { }
}

export class RemoveTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        if (this.sequencerStore.rightClickTrackPos) {
            this.trackManager.removeTrack(this.sequencerStore.rightClickTrackPos);
        }
    }
    undo() { }
    redo() { }
}

export class OpenTrackSettings implements Command {
    private uiStore = useUIStore();
    constructor() { }
    execute() {
        this.uiStore.toggleSequencerTrackSettingsDialog();
    }
    undo() { }
    redo() { }
}
