// src/features/sequencer/components/SequencerVisualisation/StepVisualisation.tsx

import React from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { PatternTrackType } from "@/core/enums/PatternTrackType";

interface StepVisualisationProps {
  trackId: string;
  patternId: string;
}

// src/features/sequencer/components/SequencerVisualisation/StepVisualisation.tsx

const StepVisualisation: React.FC<StepVisualisationProps> = ({
  trackId,
  patternId,
}) => {
  const track = usePatternStore((state) =>
    state.patterns
      .find((p) => p.id === patternId)
      ?.tracks.find((t) => t.id === trackId),
  );

  const currentStep = useSequencerStore((state) => state.playback.currentStep);

  if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) {
    return null;
  }

  const stepData = track.data;

  return (
    <div className="flex flex-row">
      {stepData.steps.map((step, index) => (
        <div
          key={index}
          className={`
            size-2 m-0.5
            ${step?.active ? "bg-ts-blue" : "bg-gray-200"}
            ${index === currentStep ? "ring-2 ring-slate-600" : ""}
          `}
          aria-label={`Step ${index + 1} of track ${trackId}`}
        />
      ))}
    </div>
  );
};

export default React.memo(StepVisualisation);
