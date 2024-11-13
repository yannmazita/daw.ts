// src/features/sequencer/components/SequencerVisualisation/StepVisualisation.tsx

import React from 'react';
import { useShallow } from 'zustand/shallow';
import { useSequencerStore } from '../../slices/useSequencerStore';

interface StepVisualisationProps {
  trackIndex: number;
}

const StepVisualisation: React.FC<StepVisualisationProps> = ({ trackIndex }) => {
  const trackInfo = useSequencerStore(state => state.trackInfo[trackIndex]);
  const steps = useSequencerStore(useShallow(state => state.steps.filter(s => s.trackIndex === trackIndex)));
  const currentStep = useSequencerStore(state => state.currentStep);
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
