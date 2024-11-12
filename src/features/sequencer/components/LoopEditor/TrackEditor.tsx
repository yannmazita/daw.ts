// src/features/sequencer/components/LoopEditor/TrackEditor.tsx

import React from 'react';
import { SequencerTrackInfo } from '@/core/interfaces/sequencer';
import StepGrid from './StepGrid';
import LoopControls from './LoopControls';

interface TrackEditorProps {
  trackInfo: SequencerTrackInfo;
  displayedSteps: number;
}

const TrackEditor: React.FC<TrackEditorProps> = ({ trackInfo, displayedSteps }) => {
  return (
    <>
      <h4 className="font-semibold mb-2">Track {trackInfo.trackIndex + 1}</h4>
      <LoopControls trackInfo={trackInfo} displayedSteps={displayedSteps} />
      <StepGrid trackInfo={trackInfo} displayedSteps={displayedSteps} />
    </>
  );
};

export default TrackEditor;
