// src/features/sequencer/components/Track.tsx

import React from 'react';
import TrackControls from './TrackControls';
import TrackSteps from './TrackSteps';

interface TrackProps {
  track: {
    id: number;
    steps: any[];
  };
  currentStep: number;
  onToggleMute: (trackId: number) => void;
  onToggleSolo: (trackId: number) => void;
  onToggleStep: (trackId: number, stepIndex: number) => void;
  getTrackMuted: (trackId: number) => boolean;
  getTrackSolo: (trackId: number) => boolean;
  getStepActive: (trackId: number, stepIndex: number) => boolean;
}

const Track: React.FC<TrackProps> = ({
  track,
  currentStep,
  onToggleMute,
  onToggleSolo,
  onToggleStep,
  getTrackMuted,
  getTrackSolo,
  getStepActive,
}) => {
  return (
    <div id={`sequencer-track-${track.id}`} className="sequencer-track flex items-center hover:opacity-100">
      <TrackControls
        trackId={track.id}
        isMuted={getTrackMuted(track.id)}
        isSolo={getTrackSolo(track.id)}
        onToggleMute={onToggleMute}
        onToggleSolo={onToggleSolo}
      />
      <TrackSteps
        trackId={track.id}
        steps={track.steps}
        currentStep={currentStep}
        isMuted={getTrackMuted(track.id)}
        isSolo={getTrackSolo(track.id)}
        onToggleStep={onToggleStep}
        getStepActive={getStepActive}
      />
    </div>
  );
};

export default Track;
