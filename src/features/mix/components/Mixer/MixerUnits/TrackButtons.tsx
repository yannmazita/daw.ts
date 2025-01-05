// src/features/mix/components/Mixer/MixerUnits/TrackButtons.tsx
import React from "react";
import { Button } from "@/common/shadcn/ui/button";
import { CassetteTape, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/common/shadcn/lib/utils";

interface TrackButtonsProps {
  muted?: boolean;
  soloed?: boolean;
  armed?: boolean;
  toggleMute?: () => void;
  toggleSolo?: () => void;
  toggleArmed?: () => void;
  className?: string;
}

export const TrackButtons: React.FC<TrackButtonsProps> = ({
  armed,
  muted,
  soloed,
  toggleMute,
  toggleSolo,
  toggleArmed,
  className,
}) => (
  <div className={cn("", className)}>
    {toggleMute !== undefined && (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "size-7 rounded-none py-1",
          muted ? "bg-muted-foreground dark:text-background" : "",
        )}
        onClick={toggleMute}
      >
        {muted ? <VolumeX /> : <Volume2 />}
      </Button>
    )}
    {toggleSolo !== undefined && (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-5 w-7 rounded-none py-1",
          soloed ? "bg-muted-foreground dark:text-background" : "",
        )}
        onClick={toggleSolo}
      >
        S
      </Button>
    )}
    {toggleArmed !== undefined && (
      <Button
        variant="outline"
        className={cn("h-5 w-7 rounded-none py-1", armed ? "bg-accent" : "")}
        size="icon"
        onClick={toggleArmed}
      >
        <CassetteTape />
      </Button>
    )}
  </div>
);
