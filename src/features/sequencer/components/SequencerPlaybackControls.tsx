// src/features/components/SequencerPlaybackControls.tsx

import React, { useState, useEffect, useCallback } from 'react';
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

  const handlePlayClick = useCallback(() => {
    playbackManager.playSequence();
  }, []);

  const handlePauseClick = useCallback(() => {
    playbackManager.pauseSequence();
  }, []);

  const handleStopClick = useCallback(() => {
    playbackManager.stopSequence();
  }, []);

  const handleLoopChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoopEnabled(e.target.checked);
  }, []);

  return (
    <div id="sequencer-container-playback" className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex space-x-2">
        <AppSmallButton onClick={handlePlayClick}>
          Play
        </AppSmallButton>
        <AppSmallButton
          onClick={handlePauseClick}
          disabled={playbackManager.getStatus() === SequenceStatus.Paused}
        >
          Pause
        </AppSmallButton>
        <AppSmallButton onClick={handleStopClick}>
          Stop
        </AppSmallButton>
        <AppSmallCheckbox
          checked={loopEnabled}
          onChange={handleLoopChange}
          rightLabel="Loop"
        />
      </div>
    </div>
  );
};

export default SequencerPlaybackControls;
