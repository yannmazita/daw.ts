// src/features/sequencer/hooks/useSequencerPlayback.ts

import { useSelector, useDispatch } from 'react-redux';
import * as Tone from 'tone';
import { setStatus, setSteps, selectStatus, selectSteps, selectTrackInfo } from '../slices/sequencerSlice';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';

export const useSequencerPlayback = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectStatus);
  const steps = useSelector(selectSteps);
  const trackInfo = useSelector(selectTrackInfo);

  const playStep = (stepIndex: number, time: number): void => {
    const soloTrackExists = trackInfo.some(track => track.solo);
    const activeTracks = trackInfo.filter(track => !track.muted && (soloTrackExists ? track.solo : true));
    const activeSteps = steps.filter(step => step.stepIndex === stepIndex && activeTracks.some(track => track.trackIndex === step.trackIndex));

    activeSteps.forEach(step => {
      const track = trackInfo.find(t => t.trackIndex === step.trackIndex);
      if (track) {
        const instrument = instrumentManager.getInstrument(track.instrumentId);
        if (instrument) {
          instrument.triggerAttackRelease(step.note, '16n', time, step.velocity / 127);
        }
      }
    });
  };

  return {

  };
};
