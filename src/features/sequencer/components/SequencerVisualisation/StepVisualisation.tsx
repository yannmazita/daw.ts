// src/features/sequencer/components/SequencerVisualisation/StepVisualisation.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { selectStepsByTrack, selectTrackInfo, selectCurrentStep } from '../../slices/sequencerSlice';

interface StepVisualisationProps {
  trackIndex: number;
}

const StepVisualisation: React.FC<StepVisualisationProps> = ({ trackIndex }) => {
  const trackInfo = useSelector(selectTrackInfo)[trackIndex];
  const steps = useSelector(selectStepsByTrack(trackIndex));
  const currentStep = useSelector(selectCurrentStep);
  const { stepsPerMeasure, loopLength } = trackInfo;

  return (
    <div className='flex flex-row'>
      {Array.from({ length: stepsPerMeasure }, (_, index) => {
        const actualStepIndex = (index % loopLength + loopLength) % loopLength;
        const step = steps.find(s => s.stepIndex === actualStepIndex) ?? { active: false };

        return (
          <div
            key={index}
            className={`
              size-2 m-0.5
              ${step.active ? 'bg-ts-blue' : 'bg-gray-200'}
              ${index === currentStep ? 'ring-2 ring-slate-600' : ''}
            `}
            aria-label={`Step ${index + 1} of track ${trackIndex}`}
          />
        );
      })}
    </div>
  );
};

export default React.memo(StepVisualisation);
