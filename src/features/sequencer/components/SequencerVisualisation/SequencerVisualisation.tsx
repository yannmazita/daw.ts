// src/features/sequencer/SequencerVisualisation/SequencerVisualisation.tsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo } from '@/features/sequencer/slices/sequencerSlice';
import '../../styles/style.css';
import TrackVisualisation from './TrackVisualisation';

const SequencerVisualisation: React.FC = () => {
  const trackInfo = useSelector(selectTrackInfo);

  const trackElements = useMemo(() => {
    return trackInfo.map(info => {
      return <TrackVisualisation key={info.trackIndex} trackInfo={info} />;
    });
  }, [trackInfo]);

  return (
    <div className='flex flex-col w-full bg-slate-50'>
      {trackElements}
    </div>
  );
};

export default SequencerVisualisation;
