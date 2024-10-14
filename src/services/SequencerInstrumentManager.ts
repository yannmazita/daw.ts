// File: SequencerInstrumentManager.ts
// Description: Manages the instruments used in the sequencer, providing functionalities to manipulate and access instruments for tracks.

import * as Tone from 'tone';
import { Instrument, InstrumentName } from '@/utils/types.ts';
import { useTrackStore } from '@/stores/trackStore';
import { useInstrumentStore } from '@/stores/instrumentStore';
import { SetTrackInstrumentCommand } from './commands/SequencerCommands';
import { CommandManager } from './CommandManager';

/**
 * Manages instruments for the sequencer, handling creation, assignment, and management of instruments for each track.
 */
export class SequencerInstrumentManager {
    private trackStore = useTrackStore();
    private instrumentStore = useInstrumentStore();
    public instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public trackInstruments: Instrument[] = [];

    /**
     * Initializes the instrument manager and sets up the initial instrument pool.
     */
    constructor(private commandManager: CommandManager) {
        this.initializeInstrumentPool();
    }

    /**
     * Creates an instrument based on the specified instrument name.
     * @param instrumentName - The name of the instrument to create.
     * @returns The created instrument.
     */
    private createInstrument(instrumentName: InstrumentName): Instrument {
        console.log('Creating instrument:', instrumentName);
        switch (instrumentName) {
            case InstrumentName.AMSynth:
                return new Tone.AMSynth().toDestination();
            case InstrumentName.FMSynth:
                return new Tone.FMSynth().toDestination();
            case InstrumentName.MembraneSynth:
                return new Tone.MembraneSynth().toDestination();
            case InstrumentName.MetalSynth:
                return new Tone.MetalSynth().toDestination();
            case InstrumentName.MonoSynth:
                return new Tone.MonoSynth().toDestination();
            case InstrumentName.NoiseSynth:
                return new Tone.NoiseSynth().toDestination();
            case InstrumentName.Synth:
            default:
                return new Tone.Synth().toDestination();
        }
    }

    /**
     * Initializes the instrument pool with one of each type of available instruments.
     */
    private initializeInstrumentPool(): void {
        console.log('Initializing instrument pool');
        Object.values(InstrumentName).forEach(name => {
            this.instrumentStore.instrumentPool[name] = this.createInstrument(name);
        });
    }

    /**
     * Initializes track instruments using a default instrument for each track.
     */
    public initializeTrackInstruments(): void {
        console.log('Initializing track instruments');
        this.instrumentStore.trackInstruments = this.trackStore.tracks.map(() => this.instrumentStore.instrumentPool[InstrumentName.Synth]);
    }

    public getTrackInstrumentName(trackIndex: number): InstrumentName | null {
        try {
            return this.instrumentStore.getTrackInstrumentName(trackIndex);
        }
        catch (error) {
            console.error('Error getting instrument name:', error);
            throw error;
        }
    }

    /**
     * Sets the instrument for a specific track.
     * @param trackIndex - The index of the track to assign the instrument to.
     * @param instrumentName - The name of the instrument to assign.
     */
    public setTrackInstrument(trackIndex: number, instrumentName: InstrumentName) {
        try {
            const command = new SetTrackInstrumentCommand(trackIndex, instrumentName);
            this.commandManager.execute(command);
        } catch (error) {
            console.error('Error setting track instrument:', error);
            throw error;
        }
    }


    /**
     * Adds an instrument to a specific position in the track list.
     * @param position - The index at which to add the instrument.
     * @param instrumentName - The name of the instrument to add. Defaults to 'Synth' if not specified.
     */
    public addTrackInstrument(position: number, instrumentName: InstrumentName = InstrumentName.Synth): void {
        this.instrumentStore.trackInstruments.splice(position, 0, this.instrumentStore.instrumentPool[instrumentName]);
    }
}
