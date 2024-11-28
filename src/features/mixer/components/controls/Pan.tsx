// src/features/mixer/components/controls/Pan.tsx

import React from "react";
import { Slider } from "@/common/shadcn/ui/slider";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const Pan: React.FC<Props> = ({ value, onChange, className }) => {
  const formatPanLabel = (value: number) => {
    if (value === 0) return "C";
    return value < 0 ? `L${Math.abs(value)}` : `R${value}`;
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="text-xs text-center">{formatPanLabel(value)}</div>
      <Slider
        defaultValue={[value]}
        value={[value]}
        max={1}
        min={-1}
        step={0.01}
        onValueChange={([newValue]) => onChange(newValue)}
        className="w-full"
      />
    </div>
  );
};

export default Pan;
