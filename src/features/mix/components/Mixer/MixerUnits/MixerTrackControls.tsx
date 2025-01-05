// src/features/mix/components/Mixer/MixerTrackControls.tsx
import { useEffect, useState, useRef } from "react";
import { useTrackState } from "@/features/composition/hooks/useTrackState";
import { useMixerTrackControls } from "../../../hooks/useMixerTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { useDeviceManager } from "../../../hooks/useDeviceManager";
import { DeviceType } from "../../../types";
import { Meter } from "@/common/components/Meter/Meter";
import { VolumeControl } from "../MixerUnits/VolumeControl";
import { PanControl } from "../MixerUnits/PanControl";
import { DeviceButtons } from "../MixerUnits/DeviceButtons";
import { TrackButtons } from "./TrackButtons";

interface MixerTrackControlsProps {
  trackId: string;
  className?: string;
  onSelectParent: (parentId: string) => void;
}

export const MixerTrackControls: React.FC<MixerTrackControlsProps> = ({
  trackId,
  className,
  onSelectParent,
}) => {
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
    getMeterValues,
  } = useMixerTrackControls(trackId);
  const meterRef = useRef<HTMLDivElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceOptions, setDeviceOptions] = useState<any>({});
  const { addDevice } = useDeviceManager(trackId);

  const handleAddDevice = (type: DeviceType) => {
    const deviceId = addDevice(type);
    setSelectedDevice(deviceId);
    setDeviceOptions({});
  };

  const handleClick = () => {
    onSelectParent(trackId);
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
      onClick={handleClick}
      className={cn(
        "flex h-full w-40 min-w-40 cursor-pointer flex-col px-1 py-2",
        className,
      )}
    >
      <div className="mx-1 text-sm font-bold">{trackState?.name}</div>
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
              toggleMute={toggleMute}
              toggleSolo={toggleSolo}
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
