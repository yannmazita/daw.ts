// src/features/components/Sequencer.tsx

import React from 'react';
import SequencerTracks from './SequencerTracks';
import SequencerTrackSettings from './SequencerTrackSettings';

const Sequencer: React.FC = () => {
  return (
    <div id='sequencer-wrapper' className='grid grid-cols-3'>
        <SequencerTrackSettings className='col-span-1'/>
        <SequencerTracks className='col-span-2'/>
    </div>
  );
};

export default Sequencer;
