// src/features/sequencer/components/Track.tsx

import React from 'react';
import TrackSteps from './TrackSteps';

interface TrackProps {
  track: {
    id: number;
    steps: any[];
  };
}

const Track: React.FC<TrackProps> = ({
  track,
}) => {
  return (
    <div id={`sequencer-track-${track.id}`} className='flex items-center hover:opacity-100'>
      <TrackSteps
        trackId={track.id}
      />
    </div>
  );
};

export default Track;
