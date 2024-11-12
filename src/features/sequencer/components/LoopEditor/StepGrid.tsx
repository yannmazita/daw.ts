// src/features/sequencer/components/LoopEditor/StepGrid.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { selectStepsByTrack } from '../../slices/sequencerSlice';
import { SequencerStep, SequencerTrackInfo } from '@/core/interfaces/sequencer';
import StepButton from './StepButton';
import { Note } from '@/core/enums';

interface StepGridProps {
  trackInfo: SequencerTrackInfo;
  displayedSteps: number;
}

const StepGrid: React.FC<StepGridProps> = ({ trackInfo, displayedSteps }) => {
  const steps = useSelector(selectStepsByTrack(trackInfo.trackIndex));

  const createDefaultStep = (stepIndex: number): SequencerStep => ({
    trackIndex: trackInfo.trackIndex,
    stepIndex,
    active: false,
    note: trackInfo.commonNote ?? Note.C4,
    velocity: trackInfo.commonVelocity ?? 100,
    modulation: 0,
    pitchBend: 0
  });

  return (
    <div className="flex flex-row">
      {Array.from({ length: displayedSteps }, (_, stepIndex) => (
        <StepButton
          key={stepIndex}
          trackInfo={trackInfo}
          stepIndex={stepIndex}
          step={steps.find(s => s.stepIndex === stepIndex) ?? createDefaultStep(stepIndex)}
        />
      ))}
    </div>
  );
};

export default StepGrid;
