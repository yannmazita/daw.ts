import { useSequencerStore } from "@/stores/sequencerStore";
import { useUIStore } from "@/stores/uiStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";

export class AddTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        if (this.sequencerStore.rightClickTrackIndex) {
            this.trackManager.addTrack(this.sequencerStore.rightClickTrackIndex);
        }
    }
    undo() { }
    redo() { }
}

export class RemoveTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private trackManager: SequencerTrackManager) { }
    execute() {
        if (this.sequencerStore.rightClickTrackIndex) {
            this.trackManager.removeTrack(this.sequencerStore.rightClickTrackIndex);
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
