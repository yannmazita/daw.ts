// src/features/components/SequencerTrackSettings.tsx

import React from 'react';

interface SequencerTrackSettingsProps {
  className?: string;
}

const SequencerTrackSettings: React.FC<SequencerTrackSettingsProps> = ({ className }) => {
  return (
    <div id='sequencer-track-settings-wrapper' className={`${className} flex items-center justify-between bg-blue-800`}>
      <div className='flex items-center space-x-4'>
      </div>
    </div>
  );
}

export default SequencerTrackSettings;
