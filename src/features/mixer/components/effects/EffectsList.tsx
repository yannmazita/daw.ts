// src/features/mixer/components/effects/EffectsList.tsx

import React from "react";
import { MixerEffect } from "@/core/interfaces/mixer";
import EffectItem from "./EffectItem";
import AddEffectButton from "./AddEffectButton";

interface Props {
  channelId: string;
  effects: MixerEffect[];
}

const EffectsList: React.FC<Props> = ({ channelId, effects }) => {
  return (
    <div className="mt-2">
      <div className="text-sm mb-1">Effects</div>
      <div className="space-y-1">
        {effects.map((effect) => (
          <EffectItem key={effect.id} channelId={channelId} effect={effect} />
        ))}
        <AddEffectButton channelId={channelId} />
      </div>
    </div>
  );
};

export default EffectsList;
