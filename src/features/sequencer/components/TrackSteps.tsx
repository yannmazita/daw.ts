// src/features/sequencer/components/TrackSteps.tsx

import React from 'react';

interface TrackStepsProps {
  trackId: number;
  steps: any[];
  currentStep: number;
  isMuted: boolean;
  isSolo: boolean;
  onToggleStep: (trackId: number, stepIndex: number) => void;
  getStepActive: (trackId: number, stepIndex: number) => boolean;
}

const TrackSteps: React.FC<TrackStepsProps> = ({
  trackId,
  steps,
  currentStep,
  isMuted,
  isSolo,
  onToggleStep,
  getStepActive,
}) => {
  return (
    <div className="track-steps flex-grow flex">
      {steps.map((_, stepIndex) => (
        <div
          key={stepIndex}
          onClick={() => onToggleStep(trackId, stepIndex)}
          className={`min-w-8 w-8 h-8 m-0.5 cursor-pointer transition-all duration-150 ${getStepActive(trackId, stepIndex) ? 'bg-ts-blue' : 'bg-gray-200'
            } ${stepIndex === currentStep ? 'ring-2 ring-yellow-400' : ''} ${isMuted && !isSolo ? 'opacity-50' : ''
            }`}
          aria-label={`Step ${stepIndex + 1} of track ${trackId}`}
          aria-pressed={getStepActive(trackId, stepIndex)}
        />
      ))}
    </div>
  );
};

export default TrackSteps;
