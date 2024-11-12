// src/features/sequencer/SequencerVisualisation/SequencerVisualisation.tsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo } from '@/features/sequencer/slices/sequencerSlice';
import '../../styles/style.css';
import TrackVisualisation from './TrackVisualisation';

const SequencerVisualisation: React.FC = () => {
  const trackInfo = useSelector(selectTrackInfo);

  const trackElements = useMemo(() => {
    return trackInfo.map(info => (
      <TrackVisualisation key={info.trackIndex} trackInfo={info} />
    ));
  }, [trackInfo]);

  return (
    <div className='bg-slate-50 overflow-x-auto'>
      <div className='inline-block'>
        {trackElements}
      </div>
    </div>
  );
};

export default SequencerVisualisation;
