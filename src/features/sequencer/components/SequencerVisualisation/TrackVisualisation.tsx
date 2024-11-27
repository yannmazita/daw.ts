// src/features/sequencer/components/SequencerVisualisation/TrackVisualisation.tsx

import React from "react";
import StepVisualisation from "./StepVisualisation";

interface TrackVisualisationProps {
  trackIndex: number;
}

const TrackVisualisation: React.FC<TrackVisualisationProps> = React.memo(
  ({ trackIndex }) => {
    return (
      <div id={`sequencer-track-visualisation-${trackIndex}`}>
        <StepVisualisation trackIndex={trackIndex} />
      </div>
    );
  },
);

export default TrackVisualisation;
