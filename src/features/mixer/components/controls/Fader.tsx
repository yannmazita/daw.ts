// src/features/mixer/components/controls/Fader.tsx

import React from "react";
import { Slider } from "@/common/shadcn/ui/slider";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const Fader: React.FC<Props> = ({ value, onChange, className }) => {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="text-xs">{value.toFixed(1)} dB</div>
      <Slider
        orientation="horizontal"
        defaultValue={[value]}
        value={[value]}
        max={6}
        min={-70}
        step={0.1}
        onValueChange={([newValue]) => onChange(newValue)}
      />
    </div>
  );
};

export default Fader;
