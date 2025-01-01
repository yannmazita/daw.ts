// src/features/mix/components/MixerControls/TrackUnit.tsx
import { useTrackState } from "@/features/arrangement/hooks/useTrackState";
import { cn } from "@/common/shadcn/lib/utils";
import { Knob } from "@/common/components/Knob/Knob";
import { useTrackControls } from "@/features/arrangement/hooks/useTrackControls";
import { useCallback, useEffect, useState } from "react";
import { CassetteTape, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";

interface TrackUnitProps {
  trackId: string;
  className?: string;
}

export const TrackUnit: React.FC<TrackUnitProps> = ({ trackId, className }) => {
  const trackState = useTrackState(trackId);
  const {
    pan,
    volume,
    muted,
    soloed,
    armed,
    setPan,
    setVolume,
    toggleMute,
    toggleSolo,
    toggleArmed,
  } = useTrackControls(trackId);
  const [localVolume, setLocalVolume] = useState(volume.toString());

  const handleKnobChange = useCallback(
    (value: number) => {
      setPan(value);
    },
    [setVolume],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalVolume(value);
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setVolume(numValue);
      }
    },
    [setVolume],
  );

  useEffect(() => {
    setLocalVolume(volume.toString());
  }, [volume]);

  return (
    <div
      className={cn("flex h-full w-40 min-w-40 flex-col px-1 py-2", className)}
    >
      <div className="mx-1 h-fit">{trackState?.name}</div>
      <div className="grid h-full grid-cols-2 bg-muted">
        <div>meter</div>
        <div className="grid grid-rows-4">
          <div className="row-span-1 flex w-full flex-col items-center pt-4">
            <Input
              type="number"
              value={localVolume}
              onChange={handleVolumeChange}
              className="input-no-wheel h-5 w-14 rounded-none bg-background py-1 text-center"
              step={0.1}
            />
          </div>
          <div className="k-full row-span-2 flex flex-col items-center gap-y-2">
            <Knob
              value={pan}
              onChange={handleKnobChange}
              radius={15}
              min={-1}
              max={1}
              step={0.01}
            />
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
            <Button
              variant="outline"
              className={cn(
                "h-5 w-7 rounded-none py-1",
                armed ? "bg-accent" : "",
              )}
              size="icon"
              onClick={toggleArmed}
            >
              <CassetteTape />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
