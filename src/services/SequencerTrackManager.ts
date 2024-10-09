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
    SetNumStepsCommand,
    ToggleTrackMutedCommand,
    ToggleTrackSoloCommand
} from './commands/SequencerCommands';
import { Note } from '@/utils/types';

export class SequencerTrackManager {
    private sequencerStore = useSequencerStore();

    constructor(
        private playbackManager: SequencerPlaybackManager,
        private commandManager: CommandManager
    ) { }

    public addTrack(insertPosition: number = this.sequencerStore.getNumTracks()): void {
        this.playbackManager.stopSequence();
        const command = new AddTrackCommand(insertPosition);
        this.commandManager.execute(command);
    }

    public removeTrack(deletePosition: number): void {
        this.playbackManager.stopSequence();
        const command = new RemoveTrackCommand(deletePosition);
        this.commandManager.execute(command);
    }

    public setNumTracks(newCount: number): void {
        this.playbackManager.stopSequence();
        const command = new SetNumStepsCommand(newCount);
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
        const track = this.sequencerStore.getTrack(trackIndex);
        if (track) {
            track.steps.forEach((_, stepIndex) => {
                this.setStepVelocity(trackIndex, stepIndex, velocity);
            });
        }
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
