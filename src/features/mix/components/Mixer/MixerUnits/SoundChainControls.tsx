// src/features/mix/components/Mixer/SoundChainUnit.tsx
import { useEffect, useState, useRef } from "react";
import { useMixerTrackControls } from "../../../hooks/useMixerTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useDeviceManager } from "@/features/mix/hooks/useDeviceManager";
import { DeviceType } from "../../../types";
import { Meter } from "@/common/components/Meter/Meter";
import { DeviceButtons } from "../MixerUnits/DeviceButtons";
import { useSelection } from "@/common/hooks/useSelection";

interface SoundChainControlsProps {
  soundChainId: string;
  className?: string;
}

export const SoundChainControls: React.FC<SoundChainControlsProps> = ({
  soundChainId,
  className,
}) => {
  const { handleClickedTrack } = useSelection();
  const { getMeterValues } = useMixerTrackControls(soundChainId);
  const meterRef = useRef<HTMLDivElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceOptions, setDeviceOptions] = useState<any>({});
  const { addDevice } = useDeviceManager(soundChainId);
  const soundChain = useEngineStore(
    (state) => state.mix.soundChains[soundChainId],
  );

  const handleAddDevice = (type: DeviceType) => {
    const deviceId = addDevice(type);
    setSelectedDevice(deviceId);
    setDeviceOptions({});
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
      onClick={() => handleClickedTrack(soundChainId)}
      className={cn(
        "flex w-40 min-w-40 cursor-pointer flex-col px-1 py-2",
        className,
      )}
    >
      <div className="mx-1 text-sm">{soundChain?.name}</div>
      <div className="bg-muted">
        <div className="flex flex-row justify-between p-4">
          <Meter getMeterValues={getMeterValues} />
          <div className="flex flex-col items-center">
            <DeviceButtons
              className="mt-auto"
              onAddEffect={() => handleAddDevice("effect")}
              onAddProcessor={() => handleAddDevice("processor")}
              onAddInstrument={() => handleAddDevice("instrument")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
