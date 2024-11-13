// src/features/sequencer/components/LoopEditor/StepButton.tsx

import React, { useCallback } from 'react';
import { useSequencerStore } from '../../slices/useSequencerStore';

interface StepButtonProps {
  trackIndex: number;
  stepIndex: number;
}

const StepButton: React.FC<StepButtonProps> = React.memo(({ trackIndex, stepIndex }) => {
  const toggleStep = useSequencerStore(state => state.toggleStep);
  const step = useSequencerStore(state => 
    state.steps.find(s => s.trackIndex === trackIndex && s.stepIndex === stepIndex)
  );
  const trackInfo = useSequencerStore(state => state.trackInfo[trackIndex]);
  const isWithinLoop = stepIndex < trackInfo.loopLength;
  const isLastLoopStep = stepIndex === trackInfo.loopLength - 1;
  const existsInState = !!step;

  const handleClick = useCallback(() => {
    if (isWithinLoop) {
      toggleStep(trackIndex, stepIndex);
    }
  }, [toggleStep, trackIndex, stepIndex, isWithinLoop]);

  return (
    <div
      onClick={handleClick}
      className={`
        size-7 m-0.5 border border-slate-400 rounded-xs
        ${isWithinLoop 
          ? (existsInState 
            ? (step.active ? 'bg-ts-blue' : 'bg-gray-200') 
            : 'bg-yellow-200') // Color for steps within loop but not in state
          : 'bg-slate-600'}
        ${isWithinLoop ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${isLastLoopStep ? 'border-r-4 border-slate-800' : ''}
      `}
    />
  );
});

export default StepButton;
