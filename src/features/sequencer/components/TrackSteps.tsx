// src/features/sequencer/components/TrackSteps.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { selectStepsByTrack, selectTrackInfo, selectCurrentStep } from '../slices/sequencerSlice';

interface TrackStepsProps {
  trackIndex: number;
}

const TrackSteps: React.FC<TrackStepsProps> = ({ trackIndex }) => {
  const trackInfo = useSelector(selectTrackInfo)[trackIndex];
  const steps = useSelector(selectStepsByTrack(trackIndex));
  const currentStep = useSelector(selectCurrentStep);
  const { stepsPerMeasure, loopStart, loopEnd } = trackInfo;

  return (
    <div className='flex'>
      {Array.from({ length: stepsPerMeasure }, (_, index) => {
        const loopLength = loopEnd - loopStart + 1;
        const actualStepIndex = ((index - loopStart) % loopLength + loopLength) % loopLength + loopStart;
        const step = steps.find(s => s.stepIndex === actualStepIndex) ?? { active: false };

        return (
          <div
            key={index}
            className={`min-w-8 w-8 h-8 m-0.5
              ${step.active ? 'bg-ts-blue' : 'bg-gray-200'}
              ${index === currentStep ? 'ring-2 ring-yellow-400' : ''}
              ${index % 4 === 0 ? 'border-l-2 border-gray-400' : ''}
            `}
            aria-label={`Step ${index + 1} of track ${trackIndex}`}
          />
        );
      })}
    </div>
  );
};

export default React.memo(TrackSteps);
