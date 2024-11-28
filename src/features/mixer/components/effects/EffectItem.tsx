// src/features/mixer/components/effects/EffectItem.tsx

import React, { useMemo, useCallback } from "react";
import { MixerEffect } from "@/core/interfaces/mixer";
import { useMixerStore } from "../../slices/useMixerStore";
import { Switch } from "@/common/shadcn/ui/switch";
import { Button } from "@/common/shadcn/ui/button";
import { Slider } from "@/common/shadcn/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/shadcn/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  channelId: string;
  effect: MixerEffect;
}

const EffectItem: React.FC<Props> = ({ channelId, effect }) => {
  const updateEffect = useMixerStore((state) => state.updateEffect);
  const removeEffect = useMixerStore((state) => state.removeEffect);

  const handleBypassToggle = useCallback(() => {
    updateEffect(channelId, effect.id, { bypass: !effect.bypass });
  }, [channelId, effect.bypass, effect.id, updateEffect]);

  const handleWetChange = useCallback(
    ([newWet]: number[]) => {
      updateEffect(channelId, effect.id, { wet: newWet });
    },
    [channelId, effect.id, updateEffect],
  );

  const handleParameterChange = useCallback(
    (key: string, value: number) => {
      updateEffect(channelId, effect.id, {
        parameters: { ...effect.parameters, [key]: value },
      });
    },
    [channelId, effect.id, effect.parameters, updateEffect],
  );

  const renderedParameters = useMemo(
    () =>
      Object.entries(effect.parameters).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <label className="text-sm text-slate-300">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <Slider
            value={[typeof value === "number" ? value : 0]}
            max={1}
            min={0}
            step={0.01}
            onValueChange={([newValue]) => handleParameterChange(key, newValue)}
            className="my-4"
          />
          <div className="text-xs text-slate-400 text-right">
            {(typeof value === "number" ? value * 100 : 0).toFixed(0)}%
          </div>
        </div>
      )),
    [effect.parameters, handleParameterChange],
  );

  return (
    <div className="bg-slate-200 rounded p-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <Switch
          checked={!effect.bypass}
          onCheckedChange={handleBypassToggle}
          className="scale-75"
        />
        <span className="flex-1 truncate">{effect.effectName}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2",
                "hover:bg-slate-300",
                "active:bg-slate-400",
              )}
            >
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-50">
            <DialogHeader>
              <DialogTitle>{effect.effectName} Parameters</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">Mix</label>
                <Slider
                  value={[effect.wet]}
                  max={1}
                  min={0}
                  step={0.01}
                  onValueChange={handleWetChange}
                  className="my-4"
                />
                <div className="text-xs text-right">
                  {(effect.wet * 100).toFixed(0)}%
                </div>
              </div>
              {renderedParameters}
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            "hover:bg-slate-300",
            "active:bg-slate-400",
          )}
          onClick={() => removeEffect(channelId, effect.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EffectItem;
