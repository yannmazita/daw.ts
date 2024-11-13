// src/features/sequencer/SequencerVisualisation/SequencerVisualisation.tsx

import React, { useMemo } from 'react';
import { useSequencerStore } from '../../slices/useSequencerStore';
import '../../styles/style.css';
import TrackVisualisation from './TrackVisualisation';

const SequencerVisualisation: React.FC = () => {
  const trackInfo = useSequencerStore((state) => state.trackInfo);

  const trackElements = useMemo(() => {
    return trackInfo.map(info => (
      <TrackVisualisation key={info.trackIndex} trackIndex={info.trackIndex} />
    ));
  }, [trackInfo]);

  return (
    <div className='bg-slate-50 p-2 overflow-x-auto'>
      <div className='inline-block'>
        {trackElements}
      </div>
    </div>
  );
};

export default React.memo(SequencerVisualisation);
