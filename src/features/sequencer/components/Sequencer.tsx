// src/features/components/Sequencer.tsx

import React from 'react';
import SequencerStepTracker from './SequencerStepTracker';
import SequencerPlaybackControls from './SequencerPlaybackControls';
import SequencerSettings from './SequencerSettings';
import SequencerTracks from './SequencerTracks';

const Sequencer: React.FC = () => {
  return (
    <div id="sequencer-container" className="flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-4">Sequencer</h2>
      <SequencerStepTracker className="mb-4" />
      <SequencerPlaybackControls className="mb-4" />
      <SequencerSettings className="mb-4" />
      <div className="sequencer-tracks-wrapper overflow-x-auto">
        <SequencerTracks />
      </div>
    </div>
  );
};

export default Sequencer;
