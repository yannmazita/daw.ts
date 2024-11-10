// src/features/sequencer/components/Track.tsx

import React from 'react';
import TrackSteps from './TrackSteps';
import { SequencerTrackInfo } from '@/core/interfaces';

interface TrackProps {
  trackInfo: SequencerTrackInfo;
}

const Track: React.FC<TrackProps> = ({
  trackInfo,
}) => {
  return (
    <div id={`sequencer-track-${trackInfo.trackIndex}`} className='flex items-center hover:opacity-100'>
      <TrackSteps
        trackIndex={trackInfo.trackIndex}
      />
    </div>
  );
};

export default Track;
