// src/features/mixer/components/MixerChannel.tsx

import React, { useCallback } from "react";
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

  const handleMuteToggle = useCallback(() => {
    updateChannel(channel.id, { mute: !channel.mute });
  }, [channel.id, channel.mute, updateChannel]);

  const handleSoloToggle = useCallback(() => {
    updateChannel(channel.id, { solo: !channel.solo });
  }, [channel.id, channel.solo, updateChannel]);

  const handleNameChange = useCallback(
    (name: string) => {
      updateChannel(channel.id, { name });
    },
    [channel.id, updateChannel],
  );

  const handlePanChange = useCallback(
    (pan: number) => {
      updateChannel(channel.id, { pan });
    },
    [channel.id, updateChannel],
  );

  const handleVolumeChange = useCallback(
    (volume: number) => {
      updateChannel(channel.id, { volume });
    },
    [channel.id, updateChannel],
  );

  const handleDelete = useCallback(() => {
    removeChannel(channel.id);
  }, [channel.id, removeChannel]);

  return (
    <div className="flex flex-col w-32 bg-slate-100 p-2 rounded">
      <ChannelHeader
        name={channel.name}
        mute={channel.mute}
        solo={channel.solo}
        onMute={handleMuteToggle}
        onSolo={handleSoloToggle}
        onNameChange={handleNameChange}
        onDelete={handleDelete}
      />

      <div className="flex gap-4 mb-4">
        <Pan
          value={channel.pan}
          onChange={handlePanChange}
          className="flex-1"
        />
        <ChannelMeter channelId={channel.id} className="w-3" />
      </div>

      <Fader
        value={channel.volume}
        onChange={handleVolumeChange}
        className="mb-4"
      />

      <EffectsList channelId={channel.id} effects={channel.effects} />
    </div>
  );
};

export default React.memo(MixerChannel);
