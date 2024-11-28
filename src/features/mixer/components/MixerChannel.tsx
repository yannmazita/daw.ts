// src/features/mixer/components/MixerChannel.tsx

import React from "react";
import { MixerChannel as IMixerChannel } from "@/core/interfaces/mixer";
import { useMixerStore } from "../slices/useMixerStore";
import Fader from "./controls/Fader";
import Pan from "./controls/Pan";
import ChannelHeader from "./controls/ChannelHeader";
import EffectsList from "./effects/EffectsList";
import ChannelMeter from "./meters/ChannelMeter";

interface Props {
  channel: IMixerChannel;
}

const MixerChannel: React.FC<Props> = ({ channel }) => {
  const updateChannel = useMixerStore((state) => state.updateChannel);
  const removeChannel = useMixerStore((state) => state.removeChannel);

  return (
    <div className="flex flex-col w-32 bg-slate-100 p-2 rounded">
      <ChannelHeader
        name={channel.name}
        mute={channel.mute}
        solo={channel.solo}
        onMute={() => updateChannel(channel.id, { mute: !channel.mute })}
        onSolo={() => updateChannel(channel.id, { solo: !channel.solo })}
        onNameChange={(name) => updateChannel(channel.id, { name })}
        onDelete={() => removeChannel(channel.id)}
      />

      <div className="flex gap-4 mb-4">
        <Pan
          value={channel.pan}
          onChange={(pan) => updateChannel(channel.id, { pan })}
          className="flex-1"
        />
        <ChannelMeter channelId={channel.id} className="w-3" />
      </div>

      <Fader
        value={channel.volume}
        onChange={(volume) => updateChannel(channel.id, { volume })}
        className="mb-4"
      />

      <EffectsList channelId={channel.id} effects={channel.effects} />
    </div>
  );
};

export default MixerChannel;
