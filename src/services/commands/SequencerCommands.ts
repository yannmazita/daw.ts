// File: SequencerCommands.ts
// Description: Defines command classes to handle sequencer commands.
import { useSequencerStore } from "@/stores/sequencerStore";
import { useWindowsStore } from "@/stores/useWindowsStore";
import { Command, StepPosition, WindowDualPaneContent } from "@/utils/interfaces";
import SequencerTrackSettingsWelcomePane from "@/components/SequencerTrackSettingsWelcomePane.vue";
import SequencerStepSettings from "@/components/SequencerStepSettings.vue";
import { markRaw } from "vue";
import { SequencerTrack } from "@/models/SequencerModels";
import { Instrument, InstrumentName, Note } from "@/utils/types";
import * as Tone from "tone";
import { SequencerInstrumentManager } from "../SequencerInstrumentManager";

/**
 * Command to add a track to the sequencer.
 */
export class AddTrackCommand implements Command {
    private sequencerStore = useSequencerStore();

    constructor(private insertPosition: number, private instrumentManager: SequencerInstrumentManager) { }

    execute(): void {
        this.sequencerStore.addTrack(this.insertPosition);
        this.instrumentManager.addInstrumentForTrack(this.insertPosition);
    }

    undo(): void {
        this.sequencerStore.removeTrack(this.insertPosition);
        this.instrumentManager.removeInstrumentForTrack(this.insertPosition);
    }

    redo(): void {
        this.execute();
    }
}

/**
 * Command to remove a track from the sequencer.
 */
export class RemoveTrackCommand implements Command {
    private sequencerStore = useSequencerStore();
    private removedTrack: SequencerTrack | null = null;
    private removedInstrument: Instrument | null = null;

    constructor(private removePosition: number, private instrumentManager: SequencerInstrumentManager) { }

    execute(): void {
        this.removedTrack = this.sequencerStore.removeTrack(this.removePosition);
        this.removedInstrument = this.instrumentManager.removeInstrumentForTrack(this.removePosition);
    }

    undo(): void {
        if (this.removedTrack) {
            this.sequencerStore.restoreTrack(this.removedTrack, this.removedTrack.id);
            if (this.removedInstrument) {
                this.instrumentManager.restoreInstrumentForTrack(
                    this.removedInstrument,
                    this.removedTrack.id
                );
            }
        }
    }

    redo(): void {
        this.execute();
    }
}

export class SetNumStepsCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: number;

    constructor(private newCount: number) {
        this.previousState = this.sequencerStore.getNumSteps();
    }
    execute(): void {
        this.sequencerStore.setNumSteps(this.newCount);
    }
    undo(): void {
        this.sequencerStore.setNumSteps(this.previousState);
    }
    redo(): void {
        this.execute();
    }
}

export class SetNumTracksCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: number;

    constructor(private newCount: number) {
        this.previousState = this.sequencerStore.getNumTracks();
    }
    execute(): void {
        this.sequencerStore.setNumTracks(this.newCount);
    }
    undo(): void {
        this.sequencerStore.setNumTracks(this.previousState);
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleStepActiveCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: boolean | null;

    constructor(private trackIndex: number, private stepIndex: number) {
        this.previousState = this.sequencerStore.getStepActive(trackIndex, stepIndex);
    }
    execute(): void {
        this.sequencerStore.toggleStepActive(this.trackIndex, this.stepIndex);
    }
    undo(): void {
        this.sequencerStore.setStepActive(this.trackIndex, this.stepIndex, this.previousState ?? false);
    }
    redo(): void {
        this.execute();
    }
}

export class SetStepVelocityCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: number | null;

    constructor(
        private trackIndex: number,
        private stepIndex: number,
        private velocity: number,
    ) {
        this.previousState = this.sequencerStore.getStepVelocity(trackIndex, stepIndex);
    }
    execute(): void {
        this.sequencerStore.setStepVelocity(this.trackIndex, this.stepIndex, this.velocity);
    }
    undo(): void {
        this.sequencerStore.setStepVelocity(this.trackIndex, this.stepIndex, this.previousState ?? 0);
    }
    redo(): void {
        this.execute();
    }
}

export class SetStepNoteCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: Note | null;

    constructor(private trackIndex: number, private stepIndex: number, private note: Note) {
        this.previousState = this.sequencerStore.getStepNote(trackIndex, stepIndex);
    }
    execute(): void {
        this.sequencerStore.setStepNote(this.trackIndex, this.stepIndex, this.note);
    }
    undo(): void {
        this.sequencerStore.setStepNote(this.trackIndex, this.stepIndex, this.previousState ?? Note.C4);
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleTrackMutedCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number) {
        this.previousState = this.sequencerStore.getTrackMuted(trackIndex);
    }
    execute(): void {
        this.sequencerStore.toggleTrackMuted(this.trackIndex);
    }
    undo(): void {
        this.sequencerStore.setTrackMuted(this.trackIndex, this.previousState ?? false);
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleTrackSoloCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number) {
        this.previousState = this.sequencerStore.getTrackSolo(trackIndex);
    }
    execute(): void {
        this.sequencerStore.toggleTrackSolo(this.trackIndex);
    }
    undo(): void {
        this.sequencerStore.setTrackSolo(this.trackIndex, this.previousState ?? false);
    }
    redo(): void {
        this.execute();
    }
}

export class SetBpmCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: number | null;

    constructor(private bpm: number) {
        this.previousState = this.sequencerStore.getBpm();
    }
    execute(): void {
        Tone.getTransport().bpm.value = this.bpm;
        this.sequencerStore.setBpm(this.bpm);
    }
    undo(): void {
        this.sequencerStore.setBpm(this.previousState ?? 120);
    }
    redo(): void {
        this.execute();
    }
}

export class SetTimeSignatureCommand implements Command {
    private sequencerStore = useSequencerStore();
    private previousState: [number, number];

    constructor(private timeSignature: [number, number]) {
        this.previousState = this.sequencerStore.getTimeSignature();
    }
    execute(): void {
        this.sequencerStore.setTimeSignature(this.timeSignature);
    }
    undo(): void {
        this.sequencerStore.setTimeSignature(this.previousState);
    }
    redo(): void {
        this.execute();
    }
}

export class ChangeInstrumentCommand implements Command {
    private previousState: InstrumentName | null = null;

    constructor(
        private trackIndex: number,
        private newInstrumentName: InstrumentName,
        private instrumentManager: SequencerInstrumentManager
    ) {
        this.previousState = this.instrumentManager.getInstrumentNameForTrack(trackIndex);
    }

    execute(): void {
        this.instrumentManager.setInstrumentForTrack(this.trackIndex, this.newInstrumentName);
    }

    undo(): void {
        if (this.previousState) {
            this.instrumentManager.setInstrumentForTrack(this.trackIndex, this.previousState);
        }
    }

    redo(): void {
        this.execute();
    }
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

    undo(): void { /* no need */ }
    redo(): void { /* no need */ }
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
    undo(): void { /* no need */ }
    redo(): void { /* no need */ }
}
