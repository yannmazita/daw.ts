// src/features/components/Sequencer.tsx

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SequencerVisualisation from './SequencerVisualisation';
import SequencerTrackSettings from './SequencerTrackSettings';
import { initializeSequencer } from '../slices/sequencerSlice';

const Sequencer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeSequencer(4)); // Initialize with 4 tracks
  }, [dispatch]);

  return (
    <div id='sequencer-wrapper' className='flex flex-col'>
      <SequencerVisualisation className='row-span-1' />
      <SequencerTrackSettings className='row-span-1' />
    </div>
  );
};

export default Sequencer;
