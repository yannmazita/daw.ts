// src/features/mix/components/Mixer/MasterTrackControls.tsx
import { useEffect, useRef } from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { Meter } from "@/common/components/Meter/Meter";
import { VolumeControl } from "../MixerUnits/VolumeControl";
import { PanControl } from "../MixerUnits/PanControl";
import { DeviceButtons } from "../MixerUnits/DeviceButtons";
import { TrackButtons } from "./TrackButtons";
import { useSelection } from "@/common/hooks/useSelection";
import { useMasterTrack } from "@/features/mix/hooks/useMasterTrack";

interface MasterTrackControlsProps {
  className?: string;
}

export const MasterTrackControls: React.FC<MasterTrackControlsProps> = ({
  className,
}) => {
  const { handleClickedTrack } = useSelection();
  const {
    masterTrack,
    pan,
    volume,
    muted,
    setPan,
    setVolume,
    toggleMute,
    getMeterValues,
  } = useMasterTrack();
  const meterRef = useRef<HTMLDivElement>(null);

  const addDevice = (type: string) => {
    console.log("todo: implement addDevice", type);
  };

  const handleAddDevice = (type: string) => {
    addDevice(type);
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

  return (
    <div
      onClick={() => handleClickedTrack("master")}
      className={cn(
        "flex h-full w-40 min-w-40 cursor-pointer flex-col px-1 py-2",
        className,
      )}
    >
      <div className="mx-1 text-sm font-bold">{masterTrack.name}</div>
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
              toggleMute={toggleMute}
            />
            <DeviceButtons
              className="mt-auto"
              onAddEffect={() => handleAddDevice("effect")}
              onAddProcessor={() => handleAddDevice("processor")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
