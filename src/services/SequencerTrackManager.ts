// File: src/services/SequencerTrackManager.ts

import { useSequencerStore } from '@/stores/sequencerStore';
import { SequencerPlaybackManager } from './SequencerPlaybackManager';
import { CommandManager } from './CommandManager';
import {
    AddTrackCommand,
    RemoveTrackCommand,
    ToggleStepActiveCommand,
    SetStepVelocityCommand,
    SetStepNoteCommand,
    SetNumTracksCommand,
    SetNumStepsCommand,
    ToggleTrackMutedCommand,
    ToggleTrackSoloCommand,
    ChangeInstrumentCommand
} from './commands/SequencerCommands';
import { InstrumentName, Note } from '@/utils/types';
import { SequencerTrack } from '@/models/SequencerModels';
import { SequencerInstrumentManager } from './SequencerInstrumentManager';

export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    constructor(
        private playbackManager: SequencerPlaybackManager,
        private instrumentManager: SequencerInstrumentManager,
        private commandManager: CommandManager
    ) {
        this.initialize();
    }

    private initialize(): void {
        console.log('SequencerTrackManager initialized');
        this.sequencerStore.structure.numTracks = 4;
        this.sequencerStore.structure.numSteps = 16;
        this.sequencerStore.structure.tracks = Array.from(
            { length: this.sequencerStore.structure.numTracks },
            (_, i) => new SequencerTrack(i, this.sequencerStore.structure.numSteps)
        );
        this.sequencerStore.structure.stepDuration = '16n';
        this.instrumentManager.initializeTrackInstruments();
    }

    public addTrack(insertPosition: number = this.sequencerStore.getNumTracks()): void {
        this.playbackManager.stopSequence();
        const command = new AddTrackCommand(insertPosition, this.instrumentManager);
        this.commandManager.execute(command);
    }

    public removeTrack(deletePosition: number): void {
        this.playbackManager.stopSequence();
        const command = new RemoveTrackCommand(deletePosition, this.instrumentManager);
        this.commandManager.execute(command);
    }

    public setNumTracks(newCount: number): void {
        this.playbackManager.stopSequence();
        const command = new SetNumTracksCommand(newCount);
        this.commandManager.execute(command);
    }

    public setTrackInstrument(trackIndex: number, instrumentName: InstrumentName): void {
        const command = new ChangeInstrumentCommand(trackIndex, instrumentName, this.instrumentManager);
        this.commandManager.execute(command);
    }

    public setNumSteps(newCount: number): void {
        this.playbackManager.stopSequence();
        const command = new SetNumStepsCommand(newCount);
        this.commandManager.execute(command);
    }

    public toggleStepActiveState(trackIndex: number, stepIndex: number): void {
        const command = new ToggleStepActiveCommand(trackIndex, stepIndex);
        this.commandManager.execute(command);
    }

    public setStepVelocity(trackIndex: number, stepIndex: number, velocity: number): void {
        const command = new SetStepVelocityCommand(trackIndex, stepIndex, velocity);
        this.commandManager.execute(command);
    }

    public setStepVelocityToTrack(trackIndex: number, velocity: number): void {
        // todo
    }

    public setStepVelocityToAllTracks(velocity: number): void {
        // todo
    }

    public setStepNote(trackIndex: number, stepIndex: number, note: Note): void {
        const command = new SetStepNoteCommand(trackIndex, stepIndex, note);
        this.commandManager.execute(command);
    }

    public setStepNoteToTrack(trackIndex: number, note: Note): void {
        // todo
    }

    public setStepNoteToAllTracks(note: Note): void {
        // todo
    }

    public toggleTrackMute(trackIndex: number): void {
        const command = new ToggleTrackMutedCommand(trackIndex);
        this.commandManager.execute(command);
    }

    public toggleTrackSolo(trackIndex: number): void {
        const command = new ToggleTrackSoloCommand(trackIndex);
        this.commandManager.execute(command);
    }
}
