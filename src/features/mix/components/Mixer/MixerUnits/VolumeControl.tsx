// src/features/mix/components/Mixer/MixerUnits/VolumeControl.tsx
import React, { useEffect, useState } from "react";
import { Input } from "@/common/shadcn/ui/input";
import { cn } from "@/common/shadcn/lib/utils";

interface VolumeControlProps {
  volume: number;
  setVolume: (value: number) => void;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  setVolume,
  className,
}) => {
  const [localVolume, setLocalVolume] = useState(volume.toString());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalVolume(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) setVolume(numValue);
  };

  useEffect(() => {
    setLocalVolume(volume.toString());
  }, [volume]);

  return (
    <Input
      type="number"
      value={localVolume}
      onChange={handleVolumeChange}
      className={cn(
        "input-no-wheel h-5 w-14 rounded-none bg-background px-0 py-1 text-center",
        className,
      )}
      min={0}
      step={0.01}
    />
  );
};
