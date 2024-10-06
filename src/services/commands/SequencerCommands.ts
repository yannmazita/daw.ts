// File: SequencerCommands.ts
// Description: Defines command classes to handle context menu actions related to the sequencer.
import { useSequencerStore } from "@/stores/sequencerStore";
import { useWindowsStore } from "@/stores/useWindowsStore";
import { Command, StepPosition, WindowDualPaneContent } from "@/utils/interfaces";
import { SequencerTrackManager } from "@/services/SequencerTrackManager";
import SequencerTrackSettingsWelcomePane from "@/components/SequencerTrackSettingsWelcomePane.vue";
import SequencerStepSettings from "@/components/SequencerStepSettings.vue";
import { markRaw } from "vue";

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
        if (this.sequencerStore.isRightClickTrackPosValid()) {
            this.trackManager.addTrack(this.sequencerStore.rightClickTrackPos);
        }
    }

    undo(): void { /* Undo logic if required */ }
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
        if (this.sequencerStore.isRightClickTrackPosValid()) {
            this.trackManager.removeTrack(this.sequencerStore.rightClickTrackPos);
        }
    }

    undo(): void { /* Undo logic if required */ }
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
    constructor(private dualPaneContents: WindowDualPaneContent[], private trackIndex: number) { }

    /**
     * Opens a window with the specified settings.
     */
    execute(): void {
        this.windowsStore.createWindow({ windowComponent: markRaw(SequencerTrackSettingsWelcomePane), windowProps: { dualPaneContents: this.dualPaneContents, trackIndex: this.trackIndex } });
    }

    undo(): void { /* Undo logic if required */ }
    redo(): void { /* Redo logic if required */ }
}

/**
 * Command to open step settings in a window.
 */
export class OpenStepSettings implements Command {
    private windowsStore = useWindowsStore();

    /**
     * Initializes a new instance of the OpenTrackSettings class.
     */
    constructor(private position: StepPosition) { }

    /**
     * Opens a window with the specified settings.
     */
    execute(): void {
        this.windowsStore.createWindow({ windowComponent: markRaw(SequencerStepSettings), windowProps: { stepPosition: this.position } });
    }
    undo(): void { /* Undo logic if required */ }
    redo(): void { /* Redo logic if required */ }
}
