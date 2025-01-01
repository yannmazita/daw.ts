// src/features/mix/components/MixerControls/MixerUnit.tsx
import { useCallback, useEffect, useState } from "react";
import { useTrackState } from "@/features/arrangement/hooks/useTrackState";
import { useMixerTrackControls } from "../../hooks/useMixerTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { Knob } from "@/common/components/Knob/Knob";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";

interface MixerUnitProps {
  trackId: string;
  className?: string;
}

export const MixerUnit: React.FC<MixerUnitProps> = ({ trackId, className }) => {
  const trackState = useTrackState(trackId);
  const {
    pan,
    volume,
    muted,
    soloed,
    setPan,
    setVolume,
    toggleMute,
    toggleSolo,
  } = useMixerTrackControls(trackId);
  const [localVolume, setLocalVolume] = useState(volume.toString());

  const handleKnobChange = useCallback(
    (value: number) => {
      setPan(value);
    },
    [setPan],
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
          <div className="row-span-2 flex h-full flex-col items-center gap-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};
