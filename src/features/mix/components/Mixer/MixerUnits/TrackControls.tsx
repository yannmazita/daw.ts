// src/features/mix/components/Mixer/MixerUnits/CompositionTrackControls.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { Meter } from "@/common/components/Meter/Meter";
import { useEffect, useState, useRef } from "react";
import { VolumeControl } from "../MixerUnits/VolumeControl";
import { PanControl } from "../MixerUnits/PanControl";
import { TrackButtons } from "../MixerUnits/TrackButtons";
import { useTrack } from "@/features/mix/hooks/useTrack";

interface TrackControlsProps {
  trackId: string;
  className?: string;
  onClick?: () => void;
}

export const TrackControls: React.FC<TrackControlsProps> = ({
  trackId,
  className,
  onClick,
}) => {
  const {
    track,
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
  } = useTrack(trackId);
  const [localVolume, setLocalVolume] = useState(volume.toString());
  const meterRef = useRef<HTMLDivElement>(null);

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
      onClick={onClick}
    >
      <div className="mx-1 text-sm">{track.name}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};
