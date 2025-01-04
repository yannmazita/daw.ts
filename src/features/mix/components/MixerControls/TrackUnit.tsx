// src/features/mix/components/MixerControls/TrackUnit.tsx
import { useTrackState } from "@/features/composition/hooks/useTrackState";
import { cn } from "@/common/shadcn/lib/utils";
import { Meter } from "@/common/components/Meter/Meter";
import { Knob } from "@/common/components/Knob/Knob";
import { useTrackControls } from "@/features/composition/hooks/useTrackControls";
import { useCallback, useEffect, useState, useRef } from "react";
import { CassetteTape, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useEngineStore } from "@/core/stores/useEngineStore";

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
    getMeterValues,
  } = useTrackControls(trackId);
  const [localVolume, setLocalVolume] = useState(volume.toString());
  const meterRef = useRef<HTMLDivElement>(null);
  const soundChains = useEngineStore((state) => state.mix.soundChains);
  const [selectedSoundChain, setSelectedSoundChain] = useState<string | null>(
    null,
  );

  const handleSoundChainChange = (value: string) => {
    setSelectedSoundChain(value);
  };

  useEffect(() => {
    let animationFrameId: number;
    const updateMeter = () => {
      if (meterRef.current) {
        const level = getMeterValues();
        if (typeof level === "number") {
          const scaledLevel = Math.max(0, Math.min(1, (level + 60) / 60)); // Scale from -60 to 0 db to 0-1
          meterRef.current.style.width = `${scaledLevel * 100}%`;
        } else if (Array.isArray(level)) {
          // Handle array of levels if needed (e.g. stereo)
          const scaledLevel = Math.max(0, Math.min(1, (level[0] + 60) / 60));
          meterRef.current.style.width = `${scaledLevel * 100}%`;
        }
      }
      animationFrameId = requestAnimationFrame(updateMeter);
    };

    updateMeter();
    return () => cancelAnimationFrame(animationFrameId);
  }, [getMeterValues]);

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
      const numValue = parseFloat(value);
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
      <div className="mx-1 text-sm">{trackState?.name}</div>
      <div className="bg-muted">
        <div className="grid h-full grid-cols-2">
          <div className="pt-4">
            <Meter getMeterValues={getMeterValues} />
          </div>
          <div className="grid grid-rows-4">
            <div className="row-span-1 flex w-full flex-col items-center pt-4">
              <Input
                type="number"
                value={localVolume}
                onChange={handleVolumeChange}
                className="input-no-wheel h-5 w-14 rounded-none bg-background px-0 py-1 text-center"
                step={0.01}
                min={0}
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
        <div className="flex flex-row justify-around">
          <Select
            onValueChange={handleSoundChainChange}
            value={selectedSoundChain}
          >
            <SelectTrigger className="h-5 w-24 rounded-none py-1 text-center">
              <SelectValue placeholder="Sound Chain" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {Object.values(soundChains).map((soundChain) => (
                <SelectItem key={soundChain.id} value={soundChain.id}>
                  {soundChain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
