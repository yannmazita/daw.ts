// src/features/sequencer/hooks/useSequencerPlayback.ts

import * as Tone from 'tone';
import { useSequencerStore } from '../slices/useSequencerStore';
import { instrumentManager } from '@/common/services/instrumentManagerInstance';

export const useSequencerPlayback = () => {
  const status = useSequencerStore(state => state.status);
  const steps = useSequencerStore(state => state.steps);
  const allTrackInfo = useSequencerStore(state => state.trackInfo);

  const playStep = (stepIndex: number, time: number): void => {
    const soloTrackExists = allTrackInfo.some(track => track.solo);
    const activeTracks = allTrackInfo.filter(track => !track.muted && (soloTrackExists ? track.solo : true));
    const activeSteps = steps.filter(step => step.stepIndex === stepIndex && activeTracks.some(track => track.trackIndex === step.trackIndex));

    activeSteps.forEach(step => {
      const track = allTrackInfo.find(t => t.trackIndex === step.trackIndex);
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
