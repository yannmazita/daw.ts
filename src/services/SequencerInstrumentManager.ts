// File: SequencerInstrumentManager.ts
// Description: Manages the instruments used in the sequencer, providing functionalities to manipulate and access instruments for tracks.

import * as Tone from 'tone';
import { Instrument, InstrumentName } from '@/utils/types.ts';
import { useSequencerStore } from '@/stores/sequencerStore';

/**
 * Manages instruments for the sequencer, handling creation, assignment, and management of instruments for each track.
 */
export class SequencerInstrumentManager {
    private sequencerStore = useSequencerStore();
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
        this.trackInstruments = this.sequencerStore.structure.tracks.map(() => this.instrumentPool[InstrumentName.Synth]);
    }

    /**
     * Sets the instrument for a specific track.
     * @param trackIndex - The index of the track to assign the instrument to.
     * @param instrumentName - The name of the instrument to assign.
     */
    public setInstrumentForTrack(trackIndex: number, instrumentName: InstrumentName) {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length && this.instrumentPool[instrumentName]) {
            this.trackInstruments[trackIndex] = this.instrumentPool[instrumentName];
        }
    }

    /**
     * Adds an instrument to a specific position in the track list.
     * @param position - The index at which to add the instrument.
     * @param instrumentName - The name of the instrument to add. Defaults to 'Synth' if not specified.
     */
    public addInstrumentForTrack(position: number, instrumentName: InstrumentName = InstrumentName.Synth): void {
        this.trackInstruments.splice(position, 0, this.instrumentPool[instrumentName]);
    }

    public restoreInstrumentForTrack(instrument: Instrument, trackIndex: number): void {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            this.trackInstruments[trackIndex] = instrument;
        }
    }

    /**
     * Removes an instrument from a specific track.
     * @param trackIndex - The index of the track from which to remove the instrument.
     */
    public removeInstrumentForTrack(trackIndex: number): Instrument | null {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            return this.trackInstruments.splice(trackIndex, 1)[0];
        }
        return null;
    }

    public getInstrumentForTrack(trackIndex: number): Instrument | null {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            return this.trackInstruments[trackIndex];
        }
        return null;
    }

    public getInstrumentNameForTrack(trackIndex: number): InstrumentName | null {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            return InstrumentName[this.trackInstruments[trackIndex].name as keyof typeof InstrumentName];
        }
        return null;
    }

    public updateInstrumentParameters(trackIndex: number, parameters: Partial<Tone.SynthOptions>): void {
        if (this.trackInstruments[trackIndex] && 'set' in this.trackInstruments[trackIndex]) {
            this.trackInstruments[trackIndex].set(parameters);
        }
    }
}
