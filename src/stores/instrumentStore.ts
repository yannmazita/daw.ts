import { InvalidTrackIndexException } from '@/utils/exceptions';
import { Instrument, InstrumentName } from '@/utils/types';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useInstrumentStore = defineStore('instrument', () => {
    const trackInstruments = reactive<Instrument[]>([]);
    const instrumentPool: Record<InstrumentName, Instrument> = {} as Record<InstrumentName, Instrument>;

    function validateTrackIndex(index: number): void {
        if (index < 0 || index >= trackInstruments.length) {
            throw new InvalidTrackIndexException(index);
        }
    }

    function addTrackInstrument(insertPosition: number, instrument: Instrument): void {
        if (insertPosition < 0 || insertPosition > trackInstruments.length) {
            throw new InvalidTrackIndexException(insertPosition);
        }
        trackInstruments.splice(insertPosition, 0, instrument);
    }

    function addTrackInstrumentDefault(insertPosition: number, instrumentName: InstrumentName = InstrumentName.Synth): void {
        if (insertPosition < 0 || insertPosition > trackInstruments.length) {
            throw new InvalidTrackIndexException(insertPosition);
        }
        trackInstruments.splice(insertPosition, 0, instrumentPool[instrumentName]);
    }

    function removeTrackInstrument(trackIndex: number): Instrument {
        validateTrackIndex(trackIndex);
        const removedInstrument: Instrument = trackInstruments.splice(trackIndex, 1)[0];
        return removedInstrument;
    }

    function getTrackInstrumentName(trackIndex: number): InstrumentName {
        validateTrackIndex(trackIndex);
        return trackInstruments[trackIndex].name as InstrumentName;
    }

    function setTrackInstrument(trackIndex: number, instrumentName: InstrumentName) {
        validateTrackIndex(trackIndex);
        trackInstruments[trackIndex] = instrumentPool[instrumentName];
    }

    return {
        trackInstruments,
        instrumentPool,
        addTrackInstrument,
        addTrackInstrumentDefault,
        removeTrackInstrument,
        getTrackInstrumentName,
        setTrackInstrument,
    };
});
