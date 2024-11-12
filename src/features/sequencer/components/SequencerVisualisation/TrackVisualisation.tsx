// src/features/sequencer/components/SequencerVisualisation/TrackVisualisation.tsx

import React from 'react';
import StepVisualisation from './StepVisualisation';
import { SequencerTrackInfo } from '@/core/interfaces';

interface TrackVisualisationProps {
  trackInfo: SequencerTrackInfo;
}

const TrackVisualisation: React.FC<TrackVisualisationProps> = ({
  trackInfo,
}) => {
  return (
    <div id={`sequencer-track-visualisation-${trackInfo.trackIndex}`}>
      <StepVisualisation
        trackIndex={trackInfo.trackIndex}
      />
    </div>
  );
};

export default TrackVisualisation;
