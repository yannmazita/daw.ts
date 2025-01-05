// src/features/mix/components/Mixer/PanControl.tsx
import React from "react";
import { Knob } from "@/common/components/Knob/Knob";
import { cn } from "@/common/shadcn/lib/utils";

interface PanControlProps {
  pan: number;
  setPan: (value: number) => void;
  className?: string;
}

export const PanControl: React.FC<PanControlProps> = ({
  pan,
  setPan,
  className,
}) => (
  <Knob
    value={pan}
    onChange={setPan}
    radius={15}
    min={-1}
    max={1}
    step={0.01}
    className={cn("", className)}
  />
);
