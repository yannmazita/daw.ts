// src/features/sequencer/SequencerTracks.tsx

import React, { useCallback, useMemo } from 'react';
import SequencerStepTracker from './SequencerStepTracker';
import SequencerPlaybackControls from './SequencerPlaybackControls';
import '../styles/style.css';

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
  ],
};

const playbackStore = {
  state: { visualStep: 0 },
};

const structureStore = {
  state: { numSteps: 16 },
};

const SequencerTracks: React.FC = () => {
  const isCurrentStep = useCallback((stepIndex: number) =>
    stepIndex === playbackStore.state.visualStep, []);

  const contentWidth = useMemo(() => {
    return 80 + (structureStore.state.numSteps * 36); // 80px for controls, 36px per step
  }, []);

  const renderTrackControls = useCallback((track: { id: number }) => (
    <div className="min-w-[72px] w-[72px] mr-2 flex-shrink-0 flex items-center space-x-2 hover:opacity-100 opacity-70 transition ease-in-out duration-150">
      <button
        onClick={() => trackManager.toggleTrackMuted(track.id)}
        className={`w-8 h-8 rounded-full focus:outline-none transition-colors duration-150 ${trackManager.getTrackMuted(track.id) ? 'bg-red-500' : 'bg-gray-300'
          }`}
      >
        M
      </button>
      <button
        onClick={() => trackManager.toggleTrackSolo(track.id)}
        className={`w-8 h-8 rounded-full focus:outline-none transition-colors duration-150 ${trackManager.getTrackSolo(track.id) ? 'bg-green-500' : 'bg-gray-300'
          }`}
      >
        S
      </button>
    </div>
  ), []);

  const renderTrackSteps = useCallback((track: { id: number, steps: any[] }) => (
    <div className="track-steps flex-grow flex">
      {track.steps.map((_, stepIndex) => (
        <div
          key={stepIndex}
          onClick={() => trackManager.toggleStepActive(track.id, stepIndex)}
          className={`min-w-8 w-8 h-8 m-0.5 cursor-pointer transition-all duration-150 ${trackManager.getStepActive(track.id, stepIndex) ? 'bg-ts-blue' : 'bg-gray-200'
            } ${isCurrentStep(stepIndex) ? 'ring-2 ring-yellow-400' : ''} ${trackManager.getTrackMuted(track.id) && !trackManager.getTrackSolo(track.id) ? 'opacity-50' : ''
            }`}
        />
      ))}
    </div>
  ), [isCurrentStep]);

  const trackElements = useMemo(() =>
    trackStore.tracks.map(track => (
      <div key={track.id} id={`sequencer-track-${track.id}`} className="sequencer-track flex items-center hover:opacity-100">
        {renderTrackControls(track)}
        {renderTrackSteps(track)}
      </div>
    )), [renderTrackControls, renderTrackSteps]);

  return (
    <div id="sequencer-tracks-container" className="flex flex-col">
      <div className="flex">
        <div className="min-w-20 w-20 flex-shrink-0"></div>
        <SequencerStepTracker className="flex-grow" />
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
