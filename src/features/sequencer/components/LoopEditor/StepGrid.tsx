// src/features/sequencer/components/LoopEditor/StepGrid.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { selectStepsByTrack } from '../../slices/sequencerSlice';
import { SequencerTrackInfo } from '@/core/interfaces/sequencer';
import StepButton from './StepButton';

interface StepGridProps {
  trackInfo: SequencerTrackInfo;
  displayedSteps: number;
}

const StepGrid: React.FC<StepGridProps> = ({ trackInfo, displayedSteps }) => {
  const steps = useSelector(selectStepsByTrack(trackInfo.trackIndex));

  return (
    <div className="flex flex-row">
      {Array.from({ length: displayedSteps }, (_, stepIndex) => (
        <StepButton
          key={stepIndex}
          trackInfo={trackInfo}
          stepIndex={stepIndex}
          step={steps.find(s => s.stepIndex === stepIndex) ?? { active: false, stepIndex, trackIndex: trackInfo.trackIndex }}
        />
      ))}
    </div>
  );
};

export default StepGrid;
