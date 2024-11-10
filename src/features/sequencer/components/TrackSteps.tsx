// src/features/sequencer/components/TrackSteps.tsx

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectStepsByTrack, selectCurrentStep, selectTrackInfo, toggleStep } from '../slices/sequencerSlice';
import { RootState } from '@/store';

interface TrackStepsProps {
  trackIndex: number;
}

const TrackSteps: React.FC<TrackStepsProps> = ({ trackIndex }) => {
  const dispatch = useDispatch();
  const trackInfo = useSelector(selectTrackInfo);
  const selectStepsForTrack = useCallback(
    (state: RootState) => selectStepsByTrack(trackIndex)(state),
    [trackIndex]
  );
  const steps = useSelector(selectStepsForTrack);
  const currentStep = useSelector(selectCurrentStep);

  return (
    <div className='flex'>
      {steps.map((step, stepIndex) => (
        <div
          key={stepIndex}
          onClick={() => dispatch(toggleStep({ trackIndex, stepIndex }))}
          className={`min-w-8 w-8 h-8 m-0.5 cursor-pointer transition-all duration-150 ${step.active ? 'bg-ts-blue' : 'bg-gray-200'
            } ${stepIndex === currentStep ? 'ring-2 ring-yellow-400' : ''} ${trackInfo[trackIndex].muted && !trackInfo[trackIndex].solo ? 'opacity-50' : ''
            }`}
          aria-label={`Step ${stepIndex + 1} of track ${trackIndex}`}
        />
      ))}
    </div>
  );
};

export default TrackSteps;
