// src/features/sequencer/SequencerVisualisation.tsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo, selectMaxTrackLength } from '@/features/sequencer/slices/sequencerSlice';
import '../styles/style.css';
import TrackVisualisation from './TrackVisualisation';

interface SequencerVisualisationProps {
  className?: string;
}



const SequencerVisualisation: React.FC<SequencerVisualisationProps> = ({ className }) => {
  const trackInfo = useSelector(selectTrackInfo);
  const maxTrackLength = useSelector(selectMaxTrackLength);

  const contentWidth = useMemo(() => {
    return 80 + (maxTrackLength * 36); // 80px for controls, 36px per step
  }, []);


  const trackElements = useMemo(() => {
    return trackInfo.map(info => {
      return <TrackVisualisation key={info.trackIndex} trackInfo={info} />;
    });
  }, [trackInfo]);

  return (
    <div id='sequencer-tracks-wrapper' className={`${className} flex flex-col bg-cyan-800`}>
      <div className='sequencer-scrollable-container'>
        <div className='sequencer-content' style={{ width: `${contentWidth}px` }}>
          <div className='flex flex-col w-full'>
            {trackElements}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequencerVisualisation;
