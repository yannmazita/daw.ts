// src/features/sequencer/hooks/useSequencerInstruments.ts

import { useSelector } from 'react-redux';
import * as Tone from 'tone';
import { InstrumentName } from '@/core/enums/instrumentName';
import { Instrument } from '@/core/types/instrument';
import { selectAllTracks } from '../slices/trackSlice';
import { useMemo } from 'react';

export const useSequencerInstruments = () => {
  const tracks = useSelector(selectAllTracks);

  const instrumentPool: Record<InstrumentName, Instrument> = {
    Synth: new Tone.Synth().toDestination(),
    AMSynth: new Tone.AMSynth().toDestination(),
    FMSynth: new Tone.FMSynth().toDestination(),
    MembraneSynth: new Tone.MembraneSynth().toDestination(),
    MetalSynth: new Tone.MetalSynth().toDestination(),
    MonoSynth: new Tone.MonoSynth().toDestination(),
    NoiseSynth: new Tone.NoiseSynth().toDestination(),
  };

  const trackInstruments = useMemo(() => tracks.map(() => instrumentPool.Synth), [tracks, instrumentPool]);

  const createInstrument = (instrumentName: InstrumentName): Instrument => {
    return instrumentPool[instrumentName];
  };

  const setTrackInstrument = (trackIndex: number, instrumentName: InstrumentName) => {
    if (trackIndex >= 0 && trackIndex < trackInstruments.length) {
      trackInstruments[trackIndex] = createInstrument(instrumentName);
      // dispatch(updateTrackInstrument({ trackIndex, instrumentName }));
    }
  };

  const getTrackInstrument = (trackIndex: number): Instrument | undefined => {
    return trackInstruments[trackIndex];
  };

  const getTrackInstrumentName = (trackIndex: number): InstrumentName | undefined => {
    const instrument = trackInstruments[trackIndex];
    return Object.entries(instrumentPool).find(([, value]) => value === instrument)?.[0] as InstrumentName | undefined;
  };

  return {
    setTrackInstrument,
    getTrackInstrument,
    getTrackInstrumentName,
    instrumentPool,
  };
};
