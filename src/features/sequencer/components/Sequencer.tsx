// src/features/components/Sequencer.tsx

import React, { useEffect } from 'react';
import { useSequencerStore } from '../slices/useSequencerStore';
import SequencerVisualisation from './SequencerVisualisation/SequencerVisualisation';
import SequencerTrackSettings from './SequencerTrackSettings';
import LoopEditor from './LoopEditor/LoopEditor';


const Sequencer: React.FC = () => {
  const initializeSequencer = useSequencerStore((state) => state.initializeSequencer);
  useEffect(() => {
    initializeSequencer(4); // Initialize with 4 tracks
  }, []);

  return (
    <div id='sequencer-wrapper' className='flex flex-col max-w-[792px]'>
      <SequencerVisualisation />
      <div className='grid grid-cols-3'>
        <SequencerTrackSettings />
        <LoopEditor />
      </div>
    </div>
  );
};

export default Sequencer;
