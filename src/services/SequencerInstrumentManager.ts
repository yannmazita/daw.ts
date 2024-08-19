import * as Tone from 'tone';
import { Instrument, InstrumentName } from '@/utils/types.ts';
import { SequencerTrack } from '@/models/SequencerModels';

export class SequencerInstrumentManager {
    public instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;
    public trackInstruments: Instrument[] = [];

    constructor() {
        this.initializeInstrumentPool();
    }

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

    private initializeInstrumentPool(): void {
        Object.values(InstrumentName).forEach(name => {
            this.instrumentPool[name] = this.createInstrument(name);
        });
    }

    public initializeTrackInstruments(tracks: SequencerTrack[]): void {
        this.trackInstruments = tracks.map(() => this.instrumentPool[InstrumentName.Synth]);
    }

    public setInstrumentForTrack(trackIndex: number, instrumentName: InstrumentName) {
        if (trackIndex >= 0 && trackIndex < this.trackInstruments.length) {
            this.trackInstruments[trackIndex] = this.instrumentPool[instrumentName];
        }
    }

    public addInstrumentForTrack(position: number): void {
        this.trackInstruments.splice(position, 0, this.instrumentPool[InstrumentName.Synth]);
    }

    public removeInstrumentForTrack(position: number): void {
        this.trackInstruments.splice(position, 1);
    }
}
