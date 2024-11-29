// src/features/mixer/components/controls/SendControls.tsx

import React, { useCallback } from "react";
import { Send } from "@/core/interfaces/mixer";
import { useMixerStore } from "../../slices/useMixerStore";
import { Switch } from "@/common/shadcn/ui/switch";
import { Button } from "@/common/shadcn/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/common/shadcn/lib/utils";
import { Slider } from "@/common/shadcn/ui/slider";

interface Props {
  channelId: string;
  sends: Send[];
}

const SendControls: React.FC<Props> = ({ channelId, sends }) => {
  const channels = useMixerStore((state) => state.channels);
  const addSend = useMixerStore((state) => state.addSend);
  const updateSend = useMixerStore((state) => state.updateSend);
  const removeSend = useMixerStore((state) => state.removeSend);

  const availableChannels = channels.filter(
    (ch) => ch.id !== channelId && !sends.some((s) => s.to === ch.id),
  );

  const handleAddSend = useCallback(
    (targetId: string) => {
      addSend({
        from: channelId,
        to: targetId,
        level: 0.5,
        preFader: false,
        mute: false,
      });
    },
    [channelId, addSend],
  );

  const handleRemoveSend = useCallback(
    (sendId: string) => {
      removeSend(sendId);
    },
    [removeSend],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Sends</h4>
        {availableChannels.length > 0 && (
          <div className="relative">
            <select
              onChange={(e) => handleAddSend(e.target.value)}
              className="appearance-none bg-transparent pr-6"
              defaultValue=""
            >
              <option value="" disabled>
                Add Send
              </option>
              {availableChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
            <Plus className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4" />
          </div>
        )}
      </div>

      {sends.map((send) => {
        const targetChannel = channels.find((ch) => ch.id === send.to);
        if (!targetChannel) return null;

        return (
          <div key={send.id} className="bg-slate-200 rounded p-2 space-y-2">
            <Slider
              value={[send.level]}
              max={1}
              min={0}
              step={0.01}
              orientation="vertical"
              className="h-24"
              onValueChange={([value]) => updateSend(send.id, { level: value })}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs truncate flex-1">
                {targetChannel.name}
              </span>
              <Switch
                checked={!send.mute}
                onCheckedChange={(checked) =>
                  updateSend(send.id, { mute: !checked })
                }
                className="scale-75"
              />
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 w-6 p-0",
                  "hover:bg-slate-300",
                  "active:bg-slate-400",
                )}
                onClick={() => handleRemoveSend(send.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs">Pre/Post</span>
                <Switch
                  checked={send.preFader}
                  onCheckedChange={(checked) =>
                    updateSend(send.id, { preFader: checked })
                  }
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SendControls;
