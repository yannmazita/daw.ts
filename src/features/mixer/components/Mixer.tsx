// src/features/mixer/components/Mixer.tsx

import React, { useMemo } from "react";
import { useMixerStore } from "../slices/useMixerStore";
import MixerChannel from "./MixerChannel";
import MasterChannel from "./MasterChannel";
import AddChannelButton from "./AddChannelButton";

const Mixer: React.FC = () => {
  const channels = useMixerStore((state) => state.channels);
  const master = useMixerStore((state) => state.master);
  const channelCount = channels.length + 1;

  const renderedChannels = useMemo(
    () =>
      channels.map((channel) => (
        <MixerChannel key={channel.id} channel={channel} />
      )),
    [channels],
  );

  return (
    <div className="flex flex-col bg-slate-50 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mixer</h2>
      <div className="flex gap-2 overflow-x-auto pb-4">
        {renderedChannels}
        <AddChannelButton channelCount={channelCount} />
        <MasterChannel channel={master} />
      </div>
    </div>
  );
};

export default Mixer;
