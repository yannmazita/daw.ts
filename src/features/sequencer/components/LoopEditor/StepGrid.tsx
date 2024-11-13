// src/features/sequencer/components/LoopEditor/StepGrid.tsx

import React, { useMemo } from 'react';
import StepButton from './StepButton';

interface StepGridProps {
  trackIndex: number;
  displayedSteps: number;
}

const StepGrid: React.FC<StepGridProps> = React.memo(({ trackIndex, displayedSteps }) => {
  const stepButtons = useMemo(() => {
    return Array.from({ length: displayedSteps }, (_, stepIndex) => (
      <StepButton
        key={`${trackIndex}-${stepIndex}`}
        trackIndex={trackIndex}
        stepIndex={stepIndex}
      />
    ));
  }, [trackIndex, displayedSteps]);

  return (
    <div className="flex flex-row">
      {stepButtons}
    </div>
  );
});

export default StepGrid;
