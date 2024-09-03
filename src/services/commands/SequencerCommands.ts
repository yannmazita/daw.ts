// File: SequencerCommands.ts
// Description: Defines command classes to handle context menu actions related to the sequencer.

import { useSequencerStore } from "@/stores/sequencerStore";
import { useWindowsStore } from "@/stores/useWindowsStore";
import { Command } from "@/utils/interfaces";
import { SequencerTrackManager } from "@/services/SequencerTrackManager";
import { AppWindowDualPaneItem } from "@/models/AppWindowDualPaneItem";

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
 * Command to open track settings in a window.
 */
export class OpenTrackSettings implements Command {
    private windowsStore = useWindowsStore();

    /**
     * Initializes a new instance of the OpenTrackSettings class.
     */
    constructor() {
    }

    /**
     * Opens a window with the specified settings.
     */
    execute(): void {
        this.windowsStore.createWindow();
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
