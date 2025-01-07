// src/features/mix/components/Mixer/MixerUnits/CompositionTrackControls.tsx
import { useTrackStatus } from "@/features/composition/hooks/useTrackStatus";
import { cn } from "@/common/shadcn/lib/utils";
import { Meter } from "@/common/components/Meter/Meter";
import { useTrackControls } from "@/features/composition/hooks/useTrackControls";
import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { VolumeControl } from "../MixerUnits/VolumeControl";
import { PanControl } from "../MixerUnits/PanControl";
import { TrackButtons } from "../MixerUnits/TrackButtons";

interface CompositionTrackControlsProps {
  trackId: string;
  className?: string;
}

export const CompositionTrackControls: React.FC<
  CompositionTrackControlsProps
> = ({ trackId, className }) => {
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

  useEffect(() => {
    setLocalVolume(volume.toString());
  }, [volume]);

  return (
    <div
      className={cn("flex h-full w-40 min-w-40 flex-col px-1 py-2", className)}
    >
      <div className="mx-1 text-sm">{trackState?.name}</div>
      <div className="bg-muted">
        <div className="flex flex-row justify-between p-4">
          <Meter getMeterValues={getMeterValues} />
          <div className="flex flex-col items-center">
            <VolumeControl
              className="mb-5"
              volume={volume}
              setVolume={setVolume}
            />
            <PanControl pan={pan} setPan={setPan} />
            <TrackButtons
              className="flex flex-col"
              muted={muted}
              soloed={soloed}
              armed={armed}
              toggleMute={toggleMute}
              toggleSolo={toggleSolo}
              toggleArmed={toggleArmed}
            />
            <div className="mt-auto">
              <Select
                onValueChange={handleSoundChainChange}
                value={selectedSoundChain}
              >
                <SelectTrigger className="h-5 w-14 rounded-none py-1 text-center">
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
      </div>
    </div>
  );
};
