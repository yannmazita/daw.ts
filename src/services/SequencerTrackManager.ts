// File: src/services/SequencerTrackManager.ts

import { SequencerPlaybackManager } from './SequencerPlaybackManager';
import { CommandManager } from './CommandManager';
import {
    AddTrackCommand,
    RemoveTrackCommand,
    ToggleStepActiveCommand,
    SetStepVelocityCommand,
    SetStepNoteCommand,
    SetTrackVelocityCommand,
    SetTrackNoteCommand,
    SetNumTracksCommand,
    SetNumStepsCommand,
    ToggleTrackMutedCommand,
    ToggleTrackSoloCommand,
    SetTrackMutedCommand,
    SetTrackSoloCommand,
    SetStepActiveCommand
} from './commands/SequencerCommands';
import { Note } from '@/utils/types';
import { SequencerTrack } from '@/models/SequencerModels';
import { SequencerInstrumentManager } from './SequencerInstrumentManager';
import { useStructureStore } from '@/stores/structureStore';
import { useTrackStore } from '@/stores/trackStore';
import { usePlaybackStore } from '@/stores/playbackStore';

export class SequencerTrackManager {
    private structureStore = useStructureStore();
    private playbackStore = usePlaybackStore();
    private trackStore = useTrackStore();

    constructor(
        private playbackManager: SequencerPlaybackManager,
        private instrumentManager: SequencerInstrumentManager,
        private commandManager: CommandManager
    ) {
        this.initialize();
    }

    private initialize(): void {
        console.log('SequencerTrackManager initialized');
        this.structureStore.setNumTracks(4);
        this.structureStore.setNumSteps(16);
        this.trackStore.tracks = Array.from(
            { length: this.structureStore.state.numTracks },
            (_, i) => new SequencerTrack(i, this.structureStore.state.numSteps)
        );
        this.playbackStore.setStepDuration('16n');
        this.instrumentManager.initializeTrackInstruments();
    }

    public addTrack(insertPosition: number = this.structureStore.state.numTracks): void {
        try {
            this.playbackManager.stopSequence();
            const command = new AddTrackCommand(insertPosition);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error adding track:', error);
            throw error;
        }
    }

    public removeTrack(deletePosition: number): void {
        try {
            this.playbackManager.stopSequence();
            const command = new RemoveTrackCommand(deletePosition);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error removing track:', error);
            throw error;
        }
    }

    public getTrackMuted(trackIndex: number): boolean {
        try {
            return this.trackStore.getTrackMuted(trackIndex);
        } catch (error) {
            console.error('Error getting track muted state:', error);
            throw error;
        }
    }

    public setTrackMuted(trackIndex: number, muted: boolean): void {
        try {
            const command = new SetTrackMutedCommand(trackIndex, muted);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting track muted state:', error);
            throw error;
        }
    }

    public toggleTrackMuted(trackIndex: number): void {
        try {
            const command = new ToggleTrackMutedCommand(trackIndex);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error toggling track muted:', error);
            throw error;
        }
    }

    public getTrackSolo(trackIndex: number): boolean {
        try {
            return this.trackStore.getTrackSolo(trackIndex);
        } catch (error) {
            console.error('Error getting track solo state:', error);
            throw error;
        }
    }

    public setTrackSolo(trackIndex: number, solo: boolean): void {
        try {
            const command = new SetTrackSoloCommand(trackIndex, solo);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting track solo state:', error);
            throw error;
        }
    }

    public toggleTrackSolo(trackIndex: number): void {
        try {
            const command = new ToggleTrackSoloCommand(trackIndex);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error toggling track solo:', error);
            throw error;
        }
    }

    public getStepActive(trackIndex: number, stepIndex: number): boolean {
        try {
            return this.trackStore.getStepActive(trackIndex, stepIndex);
        } catch (error) {
            console.error('Error getting step active state:', error);
            throw error;
        }
    }

    public setStepActive(trackIndex: number, stepIndex: number, active: boolean): void {
        try {
            const command = new SetStepActiveCommand(trackIndex, stepIndex, active);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting step active state:', error);
            throw error;
        }
    }

    public toggleStepActive(trackIndex: number, stepIndex: number): void {
        try {
            const command = new ToggleStepActiveCommand(trackIndex, stepIndex);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error toggling step active:', error);
            throw error;
        }
    }

    public getStepVelocity(trackIndex: number, stepIndex: number): number {
        try {
            return this.trackStore.getStepVelocity(trackIndex, stepIndex);
        } catch (error) {
            console.error('Error getting step velocity:', error);
            throw error;
        }
    }

    public setStepVelocity(trackIndex: number, stepIndex: number, velocity: number): void {
        try {
            const command = new SetStepVelocityCommand(trackIndex, stepIndex, velocity);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting step velocity:', error);
            throw error;
        }
    }

    public getStepNote(trackIndex: number, stepIndex: number): Note {
        try {
            return this.trackStore.getStepNote(trackIndex, stepIndex);
        } catch (error) {
            console.error('Error getting step note:', error);
            throw error;
        }
    }

    public setStepNote(trackIndex: number, stepIndex: number, note: Note): void {
        try {
            const command = new SetStepNoteCommand(trackIndex, stepIndex, note);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting step note:', error);
            throw error;
        }
    }

    public getTrackVelocity(trackIndex: number): number | null {
        try {
            return this.trackStore.getTrackVelocity(trackIndex);
        } catch (error) {
            console.error('Error getting track velocity:', error);
            throw error;
        }
    }

    public setTrackVelocity(trackIndex: number, velocity: number): void {
        try {
            const command = new SetTrackVelocityCommand(trackIndex, velocity);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting track velocity:', error);
            throw error;
        }
    }

    public getTrackNote(trackIndex: number): Note | null {
        try {
            return this.trackStore.getTrackNote(trackIndex);
        } catch (error) {
            console.error('Error getting track note:', error);
            throw error;
        }
    }

    public setTrackNote(trackIndex: number, note: Note): void {
        try {
            const command = new SetTrackNoteCommand(trackIndex, note);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting track note:', error);
            throw error;
        }
    }

    public setNumTracks(newCount: number): void {
        try {
            this.playbackManager.stopSequence();
            const command = new SetNumTracksCommand(newCount);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting number of tracks:', error);
            throw error;
        }
    }

    public setNumSteps(newCount: number): void {
        try {
            this.playbackManager.stopSequence();
            const command = new SetNumStepsCommand(newCount);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting number of steps:', error);
            throw error;
        }
    }
}
