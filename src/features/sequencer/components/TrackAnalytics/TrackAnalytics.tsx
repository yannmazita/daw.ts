// src/features/sequencer/components/SequencerVisualisation/TrackAnalytics.tsx

import React from "react";
import WaveformVisualisation from "./WaveformVisualisation";
import SpectrumAnalyzer from "./SpectrumAnalyzer";
import ChannelMeter from "@/features/mixer/components/meters/ChannelMeter";

interface TrackAnalyticsProps {
  trackId: string;
}

const TrackAnalytics: React.FC<TrackAnalyticsProps> = ({ trackId }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <WaveformVisualisation trackId={trackId} width={200} />
        <ChannelMeter channelId={trackId} className="w-4" />
      </div>
      <SpectrumAnalyzer trackId={trackId} width={230} />
    </div>
  );
};

export default TrackAnalytics;
