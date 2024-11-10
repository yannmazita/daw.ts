// src/features/sequencer/components/TrackSteps.tsx

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectStepsByTrack, selectCurrentStep, selectTrackInfo, toggleStep } from '../slices/sequencerSlice';

interface TrackStepsProps {
  trackIndex: number;
}

const TrackSteps: React.FC<TrackStepsProps> = ({ trackIndex }) => {
  const dispatch = useDispatch();
  const trackInfo = useSelector(selectTrackInfo);
  const steps = useSelector(selectStepsByTrack(trackIndex));
  const currentStep = useSelector(selectCurrentStep);
  const { stepsPerMeasure } = trackInfo[trackIndex];

  const handleStepClick = useCallback((stepIndex: number) => {
    dispatch(toggleStep({ trackIndex, stepIndex }));
  }, [dispatch, trackIndex]);

  return (
    <div className='flex'>
      {Array.from({ length: stepsPerMeasure }, (_, stepIndex) => (
        <div
          key={stepIndex}
          onClick={() => handleStepClick(stepIndex)}
          className={`min-w-8 w-8 h-8 m-0.5 cursor-pointer transition-all duration-150 
            ${steps[stepIndex]?.active ? 'bg-ts-blue' : 'bg-gray-200'}
            ${stepIndex === currentStep ? 'ring-2 ring-yellow-400' : ''}
            ${stepIndex % 4 === 0 ? 'border-l-2 border-red-400' : ''}
          `}
          aria-label={`Step ${stepIndex + 1} of track ${trackIndex}`}
        />
      ))}
    </div>
  );
};

export default React.memo(TrackSteps);
