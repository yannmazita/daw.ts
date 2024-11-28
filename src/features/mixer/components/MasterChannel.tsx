// src/features/mixer/components/MasterChannel.tsx

import React from "react";
import { MixerChannel as IMixerChannel } from "@/core/interfaces/mixer";
import { useMixerStore } from "../slices/useMixerStore";
import Fader from "./controls/Fader";
import Pan from "./controls/Pan";
import ChannelHeader from "./controls/ChannelHeader";
import EffectsList from "./effects/EffectsList";
import { cn } from "@/common/shadcn/lib/utils";
import { Badge } from "@/common/shadcn/ui/badge";
import MasterMeter from "./meters/MasterMeter";

interface Props {
  channel: IMixerChannel;
}

const MasterChannel: React.FC<Props> = ({ channel }) => {
  const updateChannel = useMixerStore((state) => state.updateChannel);

  return (
    <div
      className={cn(
        "flex flex-col w-40 bg-slate-100 p-2 rounded",
        "border-l-2 border-red-500",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="destructive" className="uppercase">
          Master
        </Badge>
      </div>

      <ChannelHeader
        name={channel.name}
        mute={channel.mute}
        solo={false} // Master channel can't be soloed
        onMute={() => updateChannel(channel.id, { mute: !channel.mute })}
        onSolo={() => {
          /* No-op for master */
        }}
        className="mb-4"
      />

      <div className="flex gap-4 mb-4">
        <Pan
          value={channel.pan}
          onChange={(pan) => updateChannel(channel.id, { pan })}
          className="flex-1"
        />
        <MasterMeter className="w-4" />
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

export default MasterChannel;
