// src/features/components/Sequencer.tsx

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SequencerVisualisation from './SequencerVisualisation';
import SequencerTrackSettings from './SequencerTrackSettings';
import LoopEditor from './LoopEditor/LoopEditor';
import { initializeSequencer } from '../slices/sequencerSlice';


const Sequencer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeSequencer(4)); // Initialize with 4 tracks
  }, [dispatch]);

  return (
    <div id='sequencer-wrapper' className='flex flex-col'>
      <SequencerVisualisation />
      <div>
        <SequencerTrackSettings />
        <LoopEditor />
      </div>
    </div>
  );
};

export default Sequencer;
