// src/features/sequencer/components/LoopEditor/StepGrid.tsx

import React, { useMemo } from "react";
import StepButton from "./StepButton";

interface StepGridProps {
  trackId: string;
  patternId: string;
  displayedSteps: number;
}

const StepGrid: React.FC<StepGridProps> = React.memo(
  ({ trackId, patternId, displayedSteps }) => {
    const stepButtons = useMemo(() => {
      return Array.from({ length: displayedSteps }, (_, stepIndex) => (
        <StepButton
          key={`${trackId}-${stepIndex}`}
          trackId={trackId}
          patternId={patternId}
          stepIndex={stepIndex}
        />
      ));
    }, [trackId, patternId, displayedSteps]);

    return <div className="flex flex-row">{stepButtons}</div>;
  },
);

export default StepGrid;
