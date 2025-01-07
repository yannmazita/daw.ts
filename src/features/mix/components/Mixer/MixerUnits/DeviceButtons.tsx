// src/features/mix/components/Mixer/MixerUnits/DeviceButtons.tsx
import React from "react";
import { Button } from "@/common/shadcn/ui/button";
import { cn } from "@/common/shadcn/lib/utils";

interface DeviceButtonsProps {
  onAddEffect?: () => void;
  onAddProcessor?: () => void;
  onAddInstrument?: () => void;
  className?: string;
}

export const DeviceButtons: React.FC<DeviceButtonsProps> = ({
  onAddEffect,
  onAddProcessor,
  onAddInstrument,
  className,
}) => (
  <div className={cn("flex flex-col self-center", className)}>
    {onAddInstrument !== undefined && (
      <Button
        variant="outline"
        size="sm"
        onClick={onAddInstrument}
        className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
      >
        Instr +
      </Button>
    )}
    {onAddEffect !== undefined && (
      <Button
        variant="outline"
        size="sm"
        onClick={onAddEffect}
        className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
      >
        Effect +
      </Button>
    )}
    {onAddProcessor !== undefined && (
      <Button
        variant="outline"
        size="sm"
        onClick={onAddProcessor}
        className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
      >
        Proc +
      </Button>
    )}
  </div>
);
