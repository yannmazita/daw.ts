// File: SequencerCommands.ts
// Description: Defines command classes to handle sequencer commands.
import { useWindowsStore } from "@/stores/useWindowsStore";
import { Command, StepPosition, WindowDualPaneContent } from "@/utils/interfaces";
import SequencerTrackSettingsWelcomePane from "@/components/SequencerTrackSettingsWelcomePane.vue";
import SequencerStepSettings from "@/components/SequencerStepSettings.vue";
import { markRaw } from "vue";
import { SequencerTrack } from "@/models/SequencerModels";
import { Instrument, InstrumentName, Note } from "@/utils/types";
import * as Tone from "tone";
import { useStructureStore } from "@/stores/structureStore";
import { useTrackStore } from "@/stores/trackStore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { SequencerInstrumentManager } from "../SequencerInstrumentManager";

/**
 * Command to add a track to the sequencer.
 */
export class AddTrackCommand implements Command {
    private structureStore = useStructureStore();
    private trackStore = useTrackStore();

    constructor(private insertPosition: number, private instrumentManager: SequencerInstrumentManager) { }

    execute(): void {
        try {
            const newTrack = new SequencerTrack(this.insertPosition, this.structureStore.state.numSteps);
            this.trackStore.addTrack(newTrack, this.insertPosition);
            this.instrumentManager.addTrackInstrumentDefault(this.insertPosition);
        } catch (error) {
            console.error('Error executing AddTrackCommand', error);
            throw error;
        }
    }

    undo(): void {
        try {
            this.trackStore.removeTrack(this.insertPosition);
            this.instrumentManager.removeTrackInstrument(this.insertPosition);
        } catch (error) {
            console.error('Error undoing AddTrackCommand', error);
            throw error;
        }
    }

    redo(): void {
        this.execute();
    }
}

/**
 * Command to remove a track from the sequencer.
 */
export class RemoveTrackCommand implements Command {
    private trackStore = useTrackStore();
    private removedTrack: SequencerTrack | null = null;
    private removedInstrument: Instrument | null = null;

    constructor(private removePosition: number, private instrumentManager: SequencerInstrumentManager) { }

    execute(): void {
        try {
            this.removedTrack = this.trackStore.removeTrack(this.removePosition);
            this.removedInstrument = this.instrumentManager.removeTrackInstrument(this.removePosition);
        } catch (error) {
            console.error('Error executing RemoveTrackCommand', error);
            throw error;
        }
    }

    undo(): void {
        try {
            if (this.removedTrack) {
                this.trackStore.addTrack(this.removedTrack, this.removedTrack.id);
                if (this.removedInstrument) {
                    this.instrumentManager.addTrackInstrument(
                        this.removedTrack.id,
                        this.removedInstrument,
                    );
                }
            }
        } catch (error) {
            console.error('Error undoing RemoveTrackCommand', error);
            throw error;
        }
    }

    redo(): void {
        this.execute();
    }
}

export class SetNumStepsCommand implements Command {
    private structureStore = useStructureStore();
    private trackStore = useTrackStore();
    private previousState: number;

    constructor(private newCount: number) {
        this.previousState = this.structureStore.state.numSteps;
    }
    execute(): void {
        try {
            this.structureStore.setNumSteps(this.newCount);
            this.trackStore.tracks.forEach(track => {
                track.setNumSteps(this.newCount);
            });
        } catch (error) {
            console.error('Error executing SetNumStepsCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.structureStore.setNumSteps(this.previousState);
            this.trackStore.tracks.forEach(track => {
                track.setNumSteps(this.previousState);
            });
        } catch (error) {
            console.error('Error undoing SetNumStepsCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetNumTracksCommand implements Command {
    private structureStore = useStructureStore();
    private trackStore = useTrackStore();
    private previousState: number;

    constructor(private newCount: number) {
        this.previousState = this.structureStore.state.numTracks;
    }
    execute(): void {
        try {
            this.structureStore.setNumTracks(this.newCount);
            while (this.newCount > this.trackStore.tracks.length) {
                this.trackStore.addTrack(new SequencerTrack(this.trackStore.tracks.length, this.structureStore.state.numSteps));
            }
            while (this.newCount < this.trackStore.tracks.length) {
                this.trackStore.removeTrack(this.trackStore.tracks.length - 1);
            }
        } catch (error) {
            console.error('Error executing SetNumTracksCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.structureStore.setNumTracks(this.previousState);
            while (this.previousState > this.trackStore.tracks.length) {
                this.trackStore.addTrack(new SequencerTrack(this.trackStore.tracks.length, this.structureStore.state.numSteps));
            }
            while (this.previousState < this.trackStore.tracks.length) {
                this.trackStore.removeTrack(this.trackStore.tracks.length - 1);
            }
        } catch (error) {
            console.error('Error undoing SetNumTracksCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetStepActiveCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number, private stepIndex: number, private active: boolean) {
        this.previousState = this.trackStore.getStepActive(trackIndex, stepIndex);
    }
    execute(): void {
        try {
            this.trackStore.setStepActive(this.trackIndex, this.stepIndex, this.active);
        } catch (error) {
            console.error('Error executing SetStepActiveCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setStepActive(this.trackIndex, this.stepIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing SetStepActiveCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleStepActiveCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;

    constructor(private trackIndex: number, private stepIndex: number) {
        this.previousState = this.trackStore.getStepActive(trackIndex, stepIndex);
    }
    execute(): void {
        try {
            this.trackStore.toggleStepActive(this.trackIndex, this.stepIndex);
        } catch (error) {
            console.error('Error executing ToggleStepActiveCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setStepActive(this.trackIndex, this.stepIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing ToggleStepActiveCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetStepVelocityCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: number | null;

    constructor(
        private trackIndex: number,
        private stepIndex: number,
        private velocity: number,
    ) {
        this.previousState = this.trackStore.getStepVelocity(trackIndex, stepIndex);
    }
    execute(): void {
        try {
            this.trackStore.setStepVelocity(this.trackIndex, this.stepIndex, this.velocity);
        } catch (error) {
            console.error('Error executing SetStepVelocityCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setStepVelocity(this.trackIndex, this.stepIndex, this.previousState ?? 0);
        } catch (error) {
            console.error('Error undoing SetStepVelocityCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetTrackVelocityCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: number | null;

    constructor(private trackIndex: number, private velocity: number) {
        this.previousState = this.trackStore.getTrackVelocity(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.setTrackVelocity(this.trackIndex, this.velocity);
        }
        catch (error) {
            console.error('Error executing SetTrackVelocityCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackVelocity(this.trackIndex, this.previousState ?? 0);
        } catch (error) {
            console.error('Error undoing SetTrackVelocityCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetStepNoteCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: Note | null;

    constructor(private trackIndex: number, private stepIndex: number, private note: Note) {
        this.previousState = this.trackStore.getStepNote(trackIndex, stepIndex);
    }
    execute(): void {
        try {
            this.trackStore.setStepNote(this.trackIndex, this.stepIndex, this.note);
        } catch (error) {
            console.error('Error executing SetStepNoteCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setStepNote(this.trackIndex, this.stepIndex, this.previousState ?? Note.C4);
        } catch (error) {
            console.error('Error undoing SetStepNoteCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetTrackNoteCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: Note | null;

    constructor(private trackIndex: number, private note: Note) {
        this.previousState = this.trackStore.getTrackNote(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.setTrackNote(this.trackIndex, this.note);
        } catch (error) {
            console.error('Error executing SetTrackNoteCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackNote(this.trackIndex, this.previousState ?? Note.C4);
        } catch (error) {
            console.error('Error undoing SetTrackNoteCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetTrackMutedCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number, private muted: boolean) {
        this.previousState = this.trackStore.getTrackMuted(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.setTrackMuted(this.trackIndex, this.muted);
        } catch (error) {
            console.error('Error executing SetTrackMutedCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackMuted(this.trackIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing SetTrackMutedCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleTrackMutedCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;

    constructor(private trackIndex: number) {
        this.previousState = this.trackStore.getTrackMuted(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.toggleTrackMuted(this.trackIndex);
        } catch (error) {
            console.error('Error executing ToggleTrackMutedCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackMuted(this.trackIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing ToggleTrackMutedCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetTrackSoloCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number, private solo: boolean) {
        this.previousState = this.trackStore.getTrackSolo(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.setTrackSolo(this.trackIndex, this.solo);
        } catch (error) {
            console.error('Error executing SetTrackSoloCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackSolo(this.trackIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing SetTrackSoloCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class ToggleTrackSoloCommand implements Command {
    private trackStore = useTrackStore();
    private previousState: boolean | null;
    constructor(private trackIndex: number) {
        this.previousState = this.trackStore.getTrackSolo(trackIndex);
    }
    execute(): void {
        try {
            this.trackStore.toggleTrackSolo(this.trackIndex);
        } catch (error) {
            console.error('Error executing ToggleTrackSoloCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.trackStore.setTrackSolo(this.trackIndex, this.previousState ?? false);
        } catch (error) {
            console.error('Error undoing ToggleTrackSoloCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetBpmCommand implements Command {
    private playbackStore = usePlaybackStore();
    private previousState: number | null;

    constructor(private bpm: number) {
        this.previousState = this.playbackStore.state.bpm;
    }
    execute(): void {
        try {
            this.playbackStore.setBpm(this.bpm);
            Tone.getTransport().bpm.value = this.bpm;
        } catch (error) {
            console.error('Error executing SetBpmCommand', error);
            throw error;
        }
    }
    undo(): void {
        try {
            this.playbackStore.setBpm(this.previousState ?? 120);
            Tone.getTransport().bpm.value = this.previousState ?? 120;
        } catch (error) {
            console.error('Error undoing SetBpmCommand', error);
            throw error;
        }
    }
    redo(): void {
        this.execute();
    }
}

export class SetTimeSignatureCommand implements Command {
    private playbackStore = usePlaybackStore();
    private previousState: [number, number];

    constructor(private timeSignature: [numerator: number, denominator: number]) {
        this.previousState = this.playbackStore.state.timeSignature;
    }
    execute(): void {
        try {
            this.playbackStore.setTimeSignature(this.timeSignature[0], this.timeSignature[1]);
            Tone.getTransport().timeSignature = this.timeSignature;
        } catch (error) {
            console.error('Error executing SetTimeSignatureCommand', error);
        }
    }
    undo(): void {
        try {
            this.playbackStore.setTimeSignature(this.previousState[0], this.previousState[1]);
            Tone.getTransport().timeSignature = this.previousState;
        } catch (error) {
            console.error('Error undoing SetTimeSignatureCommand', error);
        }

    }
    redo(): void {
        this.execute();
    }
}

export class SetTrackInstrumentCommand implements Command {
    private previousState: InstrumentName;

    constructor(
        private trackIndex: number,
        private newInstrumentName: InstrumentName,
        private instrumentManager: SequencerInstrumentManager,
    ) {
        this.previousState = this.instrumentManager.getTrackInstrumentName(trackIndex);
    }

    execute(): void {
        this.instrumentManager.setTrackInstrument(this.trackIndex, this.newInstrumentName);
    }

    undo(): void {
        this.instrumentManager.setTrackInstrument(this.trackIndex, this.previousState);
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
