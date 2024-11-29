// src/features/mixer/components/controls/SendLevel.tsx

import React from "react";
import { Slider } from "@/common/shadcn/ui/slider";
import { cn } from "@/common/shadcn/lib/utils";
import SendMeter from "../meters/SendMeter";

interface Props {
  sendId: string;
  level: number;
  onChange: (value: number) => void;
  className?: string;
}

const SendLevel: React.FC<Props> = ({ sendId, level, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Slider
        orientation="vertical"
        value={[level]}
        max={1}
        min={0}
        step={0.01}
        onValueChange={([value]) => onChange(value)}
        className="h-[100px]"
      />
      <SendMeter sendId={sendId} />
    </div>
  );
};

export default SendLevel;
