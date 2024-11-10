// src/features/components/Sequencer.tsx

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SequencerTracks from './SequencerTracks';
import SequencerTrackSettings from './SequencerTrackSettings';
import { initializeSequencer } from '../slices/sequencerSlice';

const Sequencer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeSequencer(4)); // Initialize with 4 tracks
  }, [dispatch]);

  return (
    <div id='sequencer-wrapper' className='grid grid-cols-3'>
      <SequencerTrackSettings className='col-span-1' />
      <SequencerTracks className='col-span-2' />
    </div>
  );
};

export default Sequencer;
