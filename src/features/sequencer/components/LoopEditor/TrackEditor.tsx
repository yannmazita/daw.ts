// src/features/sequencer/components/LoopEditor/TrackEditor.tsx

import React from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import StepGrid from "./StepGrid";
import LoopControls from "./LoopControls";

interface TrackEditorProps {
  trackId: string;
  patternId: string;
  displayedSteps: number;
}

const TrackEditor: React.FC<TrackEditorProps> = React.memo(
  ({ trackId, patternId, displayedSteps }) => {
    const track = usePatternStore((state) =>
      state.patterns
        .find((p) => p.id === patternId)
        ?.tracks.find((t) => t.id === trackId),
    );

    if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) {
      return null;
    }

    return (
      <div className="mb-6">
        <h4 className="font-semibold mb-2">{track.name}</h4>
        <LoopControls
          trackId={trackId}
          patternId={patternId}
          displayedSteps={displayedSteps}
        />
        <StepGrid
          trackId={trackId}
          patternId={patternId}
          displayedSteps={displayedSteps}
        />
      </div>
    );
  },
);

export default TrackEditor;
