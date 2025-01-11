// src/features/composition/components/TrackHeader.tsx
import { useTrackStatus } from "@/features/composition/hooks/useTrackStatus";
import { useTrackControls } from "@/features/composition/hooks/useTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { CassetteTape, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { useCallback, useEffect, useState } from "react";
import { useUIStore } from "@/core/stores/useUIStore";

interface TrackHeaderProps {
  trackId: string;
  className?: string;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  trackId,
  className,
}) => {
  const trackState = useTrackStatus(trackId);
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
  const [localPan, setLocalPan] = useState(pan.toString());
  const { setClickedComponentId } = useUIStore();

  const handleClick = useCallback(() => {
    setClickedComponentId(trackId);
  }, [setClickedComponentId, trackId]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalVolume(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setVolume(numValue);
      }
    },
    [setVolume],
  );

  const handlePanChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalPan(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setPan(numValue);
      }
    },
    [setPan],
  );

  useEffect(() => {
    setLocalVolume(volume.toString());
  }, [volume]);

  useEffect(() => {
    setLocalPan(pan.toString());
  }, [pan]);

  return (
    <div
      className={cn(
        "flex h-24 w-40 flex-col border-b border-border bg-background px-1 py-2",
        className,
      )}
      onClick={handleClick}
    >
      <Input
        type="text"
        value={trackState?.name}
        className="h-5 w-full rounded-none bg-background py-1 text-center"
        disabled
      />
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-x-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-5 w-7 rounded-none py-1",
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
        <div className="flex flex-row items-center justify-end">
          <Input
            type="number"
            value={localVolume}
            onChange={handleVolumeChange}
            className="input-no-wheel h-5 w-14 rounded-none bg-background px-0 py-1 text-center"
            step={0.01}
            min={0}
          />
        </div>
      </div>
      <Input
        type="number"
        value={localPan}
        onChange={handlePanChange}
        className="input-no-wheel h-5 w-14 self-center rounded-none bg-background px-0 py-1 text-center"
        step={0.01}
        min={-1}
        max={1}
      />
    </div>
  );
};
