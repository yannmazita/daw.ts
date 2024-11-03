// src/features/sequencer/SequencerStepTracker.tsx

import React, { useState, useEffect, useCallback } from 'react';
import AppRangeBar from '@/common/components/AppRangeBar';
import { SequenceStatus } from '@/core/enums/sequenceStatus';

// Mock stores and manager
const structureStore = {
  state: { numSteps: 16 },
};
const playbackStore = {
  state: { status: SequenceStatus.Stopped, visualStep: 0 },
};
const playbackManager = {
  seekTo: (step: number) => console.log(`Seek to step: ${step}`),
};

interface SequencerStepTrackerProps {
  className?: string;
}

const SequencerStepTracker: React.FC<SequencerStepTrackerProps> = ({ className }) => {
  const [manualStep, setManualStep] = useState(1);
  const [playbackStart] = useState(0);
  const playbackEnd = structureStore.state.numSteps;

  const currentDisplayStep = (() => {
    switch (playbackStore.state.status) {
      case SequenceStatus.Playing:
        return playbackStore.state.visualStep + 1;
      case SequenceStatus.Paused:
      case SequenceStatus.Stopped:
        return manualStep;
      default:
        return 1;
    }
  })();

  const handleManualStepChange = useCallback((value: number) => {
    setManualStep(value);
    playbackManager.seekTo(value - 1);
  }, []);

  const isLoopPoint = (step: number) => {
    return step === playbackStart || step === playbackEnd - 1;
  };

  useEffect(() => {
    if (playbackStore.state.status === SequenceStatus.Stopped) {
      setManualStep(1);
      playbackManager.seekTo(0);
    } else if (playbackStore.state.status === SequenceStatus.Paused) {
      setManualStep(playbackStore.state.visualStep + 1);
    }
  }, [playbackStore.state.status]);

  useEffect(() => {
    if (playbackStore.state.status !== SequenceStatus.Stopped) {
      setManualStep(playbackStore.state.visualStep + 1);
    }
  }, [playbackStore.state.visualStep]);

  return (
    <div id="sequencer-step-tracker-container" className={`flex flex-col items-center p-4 ${className}`}>
      <div className="text-2xl font-bold mb-2">
        Step: {currentDisplayStep} / {structureStore.state.numSteps}
      </div>

      <div className="flex justify-center w-full mb-4">
        {Array.from({ length: structureStore.state.numSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`w-4 h-4 mx-1 rounded-full transition-all duration-150 ${step === currentDisplayStep
              ? 'bg-ts-blue'
              : 'bg-gray-300'
              } ${isLoopPoint(step - 1) ? 'border-2 border-ts-blue' : ''}`}
          ></div>
        ))}
      </div>

      <div className='w-full'>
        <AppRangeBar
          value={manualStep}
          onChange={handleManualStepChange}
          step={1}
          min={1}
          max={structureStore.state.numSteps}
          className="w-full"
        />
      </div>

      <div className="flex justify-between w-full mt-2 text-sm">
        <span>Start: {playbackStart + 1}</span>
        <span>End: {playbackEnd}</span>
      </div>
    </div>
  );
};

export default SequencerStepTracker;
