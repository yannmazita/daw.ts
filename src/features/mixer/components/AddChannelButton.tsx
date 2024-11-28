// src/features/mixer/components/AddChannelButton.tsx

import React from "react";
import { Button } from "@/common/shadcn/ui/button";
import { Plus } from "lucide-react";
import { useMixerStore } from "../slices/useMixerStore";

interface Props {
  channelCount: number;
}

const AddChannelButton: React.FC<Props> = ({ channelCount }) => {
  const addChannel = useMixerStore((state) => state.addChannel);

  const handleAddChannel = () => {
    addChannel({
      name: `Channel ${channelCount}`,
      volume: 0,
      pan: 0,
      mute: false,
      solo: false,
      effects: [],
      sends: [],
    });
  };

  return (
    <Button
      variant="ghost"
      className="w-32 h-full min-h-[400px] border-2 border-dashed border-slate-700 hover:border-slate-500"
      onClick={handleAddChannel}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};

export default AddChannelButton;
