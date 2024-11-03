// src/features/components/SequencerPlaybackControls.tsx

import React, { useState, useEffect } from 'react';
import { SequenceStatus } from '@/core/enums/sequenceStatus';
import AppSmallButton from '@/common/components/AppSmallButton';
import AppSmallCheckbox from '@/common/components/AppSmallCheckbox';

// Mock playback manager
const playbackManager = {
  playSequence: () => console.log('Play sequence'),
  pauseSequence: () => console.log('Pause sequence'),
  stopSequence: () => console.log('Stop sequence'),
  getStatus: () => SequenceStatus.Playing,
  loopEnabled: false,
};

interface SequencerPlaybackControlsProps {
  className?: string;
}

const SequencerPlaybackControls: React.FC<SequencerPlaybackControlsProps> = ({ className }) => {
  const [loopEnabled, setLoopEnabled] = useState(playbackManager.loopEnabled);

  useEffect(() => {
    playbackManager.loopEnabled = loopEnabled;
  }, [loopEnabled]);

  return (
    <div id="sequencer-container-playback" className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex space-x-2">
        <AppSmallButton onClick={() => playbackManager.playSequence()}>
          Play
        </AppSmallButton>
        <AppSmallButton
          onClick={() => playbackManager.pauseSequence()}
          disabled={playbackManager.getStatus() === SequenceStatus.Paused}
        >
          Pause
        </AppSmallButton>
        <AppSmallButton onClick={() => playbackManager.stopSequence()}>
          Stop
        </AppSmallButton>
        <AppSmallCheckbox
          checked={loopEnabled}
          onChange={(e) => setLoopEnabled(e.target.checked)}
          rightLabel="Loop"
        />
      </div>
    </div>
  );
};

export default SequencerPlaybackControls;
