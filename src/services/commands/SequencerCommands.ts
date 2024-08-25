import { useSequencerStore } from "@/stores/sequencerStore";
import { useDialogStore } from "@/stores/dialogStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";
import { AppDialogWindowItem } from "@/models/AppDialogWindowItem";

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
    private dialogStore = useDialogStore();
    constructor(private id: string, private dialogTitle: string, private dialogItems: AppDialogWindowItem[], private xPos: number, private yPos: number, private shouldBeCentered: boolean) { }
    execute() {
        this.dialogStore.openDialog(this.id, this.dialogTitle, this.dialogItems, this.xPos, this.yPos, this.shouldBeCentered);
    }
    undo() { }
    redo() { }
}
