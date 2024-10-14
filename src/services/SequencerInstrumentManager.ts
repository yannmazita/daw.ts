// File: SequencerInstrumentManager.ts
// Description: Manages the instruments used in the sequencer, providing functionalities to manipulate and access instruments for tracks.

import * as Tone from 'tone';
import { Instrument, InstrumentName } from '@/utils/types.ts';
import { useTrackStore } from '@/stores/trackStore';
import { InvalidTrackIndexException } from '@/utils/exceptions';

/**
 * Manages instruments for the sequencer, handling creation, assignment, and management of instruments for each track.
 */
export class SequencerInstrumentManager {
    private trackStore = useTrackStore();
    public instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public trackInstruments: Instrument[] = [];

    /**
     * Initializes the instrument manager and sets up the initial instrument pool.
     */
    constructor() {
        this.initializeInstrumentPool();
    }

    /**
     * Creates an instrument based on the specified instrument name.
     * @param instrumentName - The name of the instrument to create.
     * @returns The created instrument.
     */
    private createInstrument(instrumentName: InstrumentName): Instrument {
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
        Object.values(InstrumentName).forEach(name => {
            this.instrumentPool[name] = this.createInstrument(name);
        });
    }

    /**
     * Initializes track instruments using a default instrument for each track.
     */
    public initializeTrackInstruments(): void {
        this.trackInstruments = this.trackStore.tracks.map(() => this.instrumentPool[InstrumentName.Synth]);
    }

    public validateTrackIndex(index: number): void {
        if (index < 0 || index >= this.trackInstruments.length) {
            throw new InvalidTrackIndexException(index);
        }
    }

    public addTrackInstrument(insertPosition: number, instrument: Instrument): void {
        if (insertPosition < 0 || insertPosition > this.trackInstruments.length) {
            throw new InvalidTrackIndexException(insertPosition);
        }
        this.trackInstruments.splice(insertPosition, 0, instrument);
    }

    public addTrackInstrumentDefault(insertPosition: number, instrumentName: InstrumentName = InstrumentName.Synth): void {
        if (insertPosition < 0 || insertPosition > this.trackInstruments.length) {
            throw new InvalidTrackIndexException(insertPosition);
        }
        this.trackInstruments.splice(insertPosition, 0, this.instrumentPool[instrumentName]);
    }

    public removeTrackInstrument(trackIndex: number): Instrument {
        this.validateTrackIndex(trackIndex);
        const removedInstrument: Instrument = this.trackInstruments.splice(trackIndex, 1)[0];
        return removedInstrument;
    }

    public getTrackInstrumentName(trackIndex: number): InstrumentName {
        this.validateTrackIndex(trackIndex);
        return this.trackInstruments[trackIndex].name as InstrumentName;
    }

    public setTrackInstrument(trackIndex: number, instrumentName: InstrumentName) {
        this.validateTrackIndex(trackIndex);
        this.trackInstruments[trackIndex] = this.instrumentPool[instrumentName];
    }
}
