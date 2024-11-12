// src/features/sequencer/components/LoopEditor/StepButton.tsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleStep } from '../../slices/sequencerSlice';
import { SequencerTrackInfo, SequencerStep } from '@/core/interfaces/sequencer';

interface StepButtonProps {
  trackInfo: SequencerTrackInfo;
  stepIndex: number;
  step: SequencerStep;
}

const StepButton: React.FC<StepButtonProps> = ({ trackInfo, stepIndex, step }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleStep({ trackIndex: trackInfo.trackIndex, stepIndex }));
  };

  const isWithinLoop = stepIndex < trackInfo.loopLength;

  return (
    <div
      onClick={handleClick}
      className={`
        w-8 h-8 m-0.5 ring-1 ring-slate-400 rounded-xs
        ${isWithinLoop ? (step.active ? 'bg-ts-blue' : 'bg-gray-200') : 'bg-slate-600'}
        ${isWithinLoop ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${stepIndex === trackInfo.loopLength - 1 ? 'border-r-4 border-slate-800' : ''}
        ${(stepIndex + 1) % 4 === 0 ? 'mr-2' : ''}
      `}
    />
  );
};

export default StepButton;
