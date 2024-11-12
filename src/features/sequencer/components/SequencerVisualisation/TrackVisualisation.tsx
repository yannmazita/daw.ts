// src/features/sequencer/components/TrackVisualisation.tsx

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
    <div id={`sequencer-track-${trackInfo.trackIndex}`} className='flex items-center hover:opacity-100'>
      <StepVisualisation
        trackIndex={trackInfo.trackIndex}
      />
    </div>
  );
};

export default TrackVisualisation;
