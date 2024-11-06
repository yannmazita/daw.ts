// src/features/sequencer/SequencerTracks.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SequencerStepTracker from './SequencerStepTracker';
import SequencerPlaybackControls from './SequencerPlaybackControls';
import '../styles/style.css';
import Track from './Track';

// Mock managers and stores
const trackManager = {
  toggleTrackMuted: (id: number) => console.log(`Toggle mute for track ${id}`),
  toggleTrackSolo: (id: number) => console.log(`Toggle solo for track ${id}`),
  getTrackMuted: (id: number) => false,
  getTrackSolo: (id: number) => false,
  toggleStepActive: (trackId: number, stepIndex: number) => console.log(`Toggle step ${stepIndex} for track ${trackId}`),
  getStepActive: (trackId: number, stepIndex: number) => Math.random() > 0.5,
};

const trackStore = {
  tracks: [
    { id: 0, steps: Array(16).fill(null) },
    { id: 1, steps: Array(16).fill(null) },
    { id: 2, steps: Array(16).fill(null) },
    { id: 3, steps: Array(16).fill(null) },
    { id: 4, steps: Array(16).fill(null) },
    { id: 5, steps: Array(16).fill(null) },
    { id: 6, steps: Array(16).fill(null) },
    { id: 7, steps: Array(16).fill(null) },
  ],
};

const playbackStore = {
  state: { visualStep: 0 },
};

const structureStore = {
  state: { numSteps: 16 },
};

const SequencerTracks: React.FC = () => {
  const [numSteps, setNumSteps] = useState(structureStore.state.numSteps);  // Mockup, may use redux reducer later

  useEffect(() => {
    // Mockup, may use redux reducer later
    setNumSteps(structureStore.state.numSteps);
  }, []);

  const contentWidth = useMemo(() => {
    return 80 + (structureStore.state.numSteps * 36); // 80px for controls, 36px per step
  }, []);

  const handleToggleMute = useCallback((trackId: number) => {
    trackManager.toggleTrackMuted(trackId);
  }, []);

  const handleToggleSolo = useCallback((trackId: number) => {
    trackManager.toggleTrackSolo(trackId);
  }, []);

  const handleToggleStep = useCallback((trackId: number, stepIndex: number) => {
    trackManager.toggleStepActive(trackId, stepIndex);
  }, []);

  const trackElements = useMemo(() =>
    trackStore.tracks.map(track => (
      <Track
        key={track.id}
        track={track}
        currentStep={playbackStore.state.visualStep}
        onToggleMute={handleToggleMute}
        onToggleSolo={handleToggleSolo}
        onToggleStep={handleToggleStep}
        getTrackMuted={trackManager.getTrackMuted}
        getTrackSolo={trackManager.getTrackSolo}
        getStepActive={trackManager.getStepActive}
      />
    )), [handleToggleMute, handleToggleSolo, handleToggleStep]);

 return (
    <div id="sequencer-tracks-container" className="flex flex-col">
      <div className="flex">
        <div className="min-w-20 w-20 flex-shrink-0"></div>
        <SequencerStepTracker className="flex-grow" numSteps={numSteps} />
      </div>
      <div className="sequencer-scrollable-container">
        <div className="sequencer-content" style={{ width: `${contentWidth}px` }}>
          <div className="flex flex-col w-full">
            {trackElements}
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="min-w-20 w-20 flex-shrink-0"></div>
        <SequencerPlaybackControls className="flex-grow" />
      </div>
    </div>
  );
};

export default SequencerTracks;
