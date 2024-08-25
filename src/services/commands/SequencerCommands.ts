// File: SequencerCommands.ts
// Description: Defines command classes to handle actions related to sequencer tracks and dialogs.

import { useSequencerStore } from "@/stores/sequencerStore";
import { useDialogStore } from "@/stores/dialogStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "../SequencerTrackManager";
import { AppDialogWindowItem } from "@/models/AppDialogWindowItem";

/**
 * Command to add a track to the sequencer.
 */
export class AddTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    /**
     * Initializes a new instance of the AddTrackCommand class.
     * @param trackManager The track manager responsible for adding tracks.
     */
    constructor(private trackManager: SequencerTrackManager) { }

    /**
     * Executes the command to add a track at the position stored in the sequencer store.
     */
    execute(): void {
        if (this.sequencerStore.rightClickTrackPos !== null) {
            this.trackManager.addTrack(this.sequencerStore.rightClickTrackPos);
        }
    }

    /**
     * Placeholder for undo functionality.
     */
    undo(): void { /* Undo logic if required */ }

    /**
     * Placeholder for redo functionality.
     */
    redo(): void { /* Redo logic if required */ }
}

/**
 * Command to remove a track from the sequencer.
 */
export class RemoveTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    /**
     * Initializes a new instance of the RemoveTrackCommand class.
     * @param trackManager The track manager responsible for removing tracks.
     */
    constructor(private trackManager: SequencerTrackManager) { }

    /**
     * Executes the command to remove a track at the position stored in the sequencer store.
     */
    execute(): void {
        if (this.sequencerStore.rightClickTrackPos !== null) {
            this.trackManager.removeTrack(this.sequencerStore.rightClickTrackPos);
        }
    }

    /**
     * Placeholder for undo functionality.
     */
    undo(): void { /* Undo logic if required */ }

    /**
     * Placeholder for redo functionality.
     */
    redo(): void { /* Redo logic if required */ }
}

/**
 * Command to open track settings in a dialog window.
 */
export class OpenTrackSettings implements Command {
    private dialogStore = useDialogStore();

    /**
     * Initializes a new instance of the OpenTrackSettings class.
     * @param id Unique identifier for the dialog.
     * @param dialogTitle The title of the dialog.
     * @param dialogItems List of items to be displayed in the dialog.
     * @param xPos The x-coordinate for the dialog's position.
     * @param yPos The y-coordinate for the dialog's position.
     * @param shouldBeCentered Indicates whether the dialog should be centered.
     * @param context Contextual data related to the dialog.
     */
    constructor(private id: string, private dialogTitle: string, private dialogItems: AppDialogWindowItem[], private xPos: number, private yPos: number, private shouldBeCentered: boolean, private context: unknown) { }

    /**
     * Opens a dialog window with the specified settings.
     */
    execute(): void {
        this.dialogStore.openDialog(this.id, this.dialogTitle, this.dialogItems, this.xPos, this.yPos, this.shouldBeCentered, this.context);
    }

    /**
     * Placeholder for undo functionality.
     */
    undo(): void { /* Undo logic if required */ }

    /**
     * Placeholder for redo functionality.
     */
    redo(): void { /* Redo logic if required */ }
}
