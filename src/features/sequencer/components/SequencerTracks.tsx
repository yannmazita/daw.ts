// src/features/sequencer/SequencerTracks.tsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo, selectMaxTrackLength } from '@/features/sequencer/slices/sequencerSlice';
import '../styles/style.css';
import Track from './Track';

interface SequencerTracksProps {
  className?: string;
}



const SequencerTracks: React.FC<SequencerTracksProps> = ({ className }) => {
  const trackInfo = useSelector(selectTrackInfo);
  const maxTrackLength = useSelector(selectMaxTrackLength);

  const contentWidth = useMemo(() => {
    return 80 + (maxTrackLength * 36); // 80px for controls, 36px per step
  }, []);


  const trackElements = useMemo(() => {
    return trackInfo.map(info => {
      return <Track key={info.trackIndex} trackInfo={info} />;
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

export default SequencerTracks;
