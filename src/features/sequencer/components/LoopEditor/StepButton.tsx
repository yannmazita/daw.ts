// src/features/sequencer/components/LoopEditor/StepButton.tsx

import React from 'react';
import { useSequencerStore } from '../../slices/useSequencerStore';
import { SequencerTrackInfo, SequencerStep } from '@/core/interfaces/sequencer';

interface StepButtonProps {
  trackInfo: SequencerTrackInfo;
  stepIndex: number;
  displayedSteps: number;
  step: SequencerStep;
}

const StepButton: React.FC<StepButtonProps> = ({ trackInfo, stepIndex, displayedSteps, step }) => {
  const toggleStep = useSequencerStore((state) => state.toggleStep);
  const handleClick = () => {
    toggleStep(trackInfo.trackIndex, stepIndex);
  };

  const isWithinLoop = stepIndex < trackInfo.loopLength;

  return (
    <div
      onClick={handleClick}
      className={`
        size-7 m-0.5 border border-slate-400 rounded-xs
        ${isWithinLoop ? (step.active ? 'bg-ts-blue' : 'bg-gray-200') : 'bg-slate-600'}
        ${isWithinLoop ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${stepIndex === trackInfo.loopLength - 1 ? 'border-r-4 border-slate-800' : ''}
        ${((stepIndex + 1) % 4 === 0) && (stepIndex !== displayedSteps - 1) ? 'mr-2' : ''}
      `}
    />
  );
};

export default StepButton;
