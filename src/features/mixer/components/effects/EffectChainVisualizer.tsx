// src/features/mixer/components/effects/EffectChainVisualizer.tsx

import React from "react";
import { MixerEffect } from "@/core/interfaces/mixer";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  effects: MixerEffect[];
}

const EffectChainVisualizer: React.FC<Props> = ({ effects }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {effects.map((effect, index) => (
        <React.Fragment key={effect.id}>
          <div
            className={cn(
              "px-2 py-1 rounded text-xs",
              effect.bypass ? "bg-slate-200" : "bg-blue-100",
            )}
          >
            {effect.effectName}
          </div>
          {index < effects.length - 1 && (
            <div className="w-2 h-px bg-slate-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EffectChainVisualizer;
