// src/features/sequencer/components/SequencerVisualisation/TrackAnalytics.tsx

import React from 'react';
import WaveformVisualisation from './WaveformVisualisation';
import SpectrumAnalyzer from './SpectrumAnalyzer';

interface TrackAnalyticsProps {
  trackIndex: number;
}

const TrackAnalytics: React.FC<TrackAnalyticsProps> = ({ trackIndex }) => {
  return (
    <div className="flex flex-col gap-4">
      <WaveformVisualisation trackIndex={trackIndex} width={230} />
      <SpectrumAnalyzer trackIndex={trackIndex} width={230}/>
    </div>
  );
};

export default TrackAnalytics;
