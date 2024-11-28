// src/features/mixer/components/effects/AddEffectButton.tsx

import React, { useCallback } from "react";
import { Button } from "@/common/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/shadcn/ui/dialog";
import { Plus } from "lucide-react";
import { EffectName } from "@/core/enums/EffectName";
import { useMixerStore } from "../../slices/useMixerStore";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  channelId: string;
}

const AddEffectButton: React.FC<Props> = ({ channelId }) => {
  const addEffect = useMixerStore((state) => state.addEffect);

  const handleAddEffect = useCallback(
    (effectName: EffectName) => {
      addEffect(channelId, {
        effectName,
        bypass: false,
        wet: 1,
        parameters: {},
      });
    },
    [addEffect, channelId],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full h-8 border border-dashed border-slate-600",
            "hover:bg-slate-200",
            "active:bg-slate-300",
            "flex items-center justify-center gap-2",
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Effect</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-50">
        <DialogHeader>
          <DialogTitle>Add Effect</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(EffectName).map((effectName) => (
            <Button
              key={effectName}
              variant="secondary"
              className={cn(
                "h-auto py-2 px-3",
                "hover:bg-slate-200",
                "active:bg-slate-300",
              )}
              onClick={() => handleAddEffect(effectName)}
            >
              {effectName}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEffectButton;
