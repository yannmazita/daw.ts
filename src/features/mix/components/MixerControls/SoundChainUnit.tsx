// src/features/mix/components/MixerControls/SoundChainUnit.tsx
import { useEffect, useState, useRef } from "react";
import { useMixerTrackControls } from "../../hooks/useMixerTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { Button } from "@/common/shadcn/ui/button";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useDeviceManager } from "@/features/mix/hooks/useDeviceManager";
import { DeviceType } from "../../types";
import { Meter } from "@/common/components/Meter/Meter";

interface SoundChainUnitProps {
  soundChainId: string;
  className?: string;
  onSelectParent: (parentId: string) => void;
}

export const SoundChainUnit: React.FC<SoundChainUnitProps> = ({
  soundChainId,
  className,
  onSelectParent,
}) => {
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

  const handleClick = () => {
    onSelectParent(soundChainId);
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
      <div className="mx-1 text-sm">{soundChain?.name}</div>
      <div className="flex flex-row justify-center space-x-5 bg-muted">
        <div className="pt-4">
          <Meter getMeterValues={getMeterValues} />
        </div>
        <div className="flex flex-col self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddDevice("effect")}
            className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
          >
            Effect +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddDevice("processor")}
            className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
          >
            Proc +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddDevice("instrument")}
            className="h-5 w-14 rounded-none bg-primary p-1 text-primary-foreground"
          >
            Instr +
          </Button>
        </div>
      </div>
    </div>
  );
};
