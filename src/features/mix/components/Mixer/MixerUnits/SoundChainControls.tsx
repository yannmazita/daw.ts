// src/features/mix/components/Mixer/SoundChainControls.tsx
import { useEffect, useRef } from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { Meter } from "@/common/components/Meter/Meter";
import { DeviceButtons } from "../MixerUnits/DeviceButtons";
import { useSelection } from "@/common/hooks/useSelection";
import { useSoundChain } from "@/features/mix/hooks/useSoundChain";

interface SoundChainControlsProps {
  trackId: string;
  className?: string;
}

export const SoundChainControls: React.FC<SoundChainControlsProps> = ({
  trackId,
  className,
}) => {
  const { setClickedComponentId } = useSelection();
  const { soundChain, getMeterValues } = useSoundChain(trackId);
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
    soundChain && (
      <div
        onClick={() => setClickedComponentId(soundChain.id)}
        className={cn(
          "flex w-40 min-w-40 cursor-pointer flex-col px-1 py-2",
          className,
        )}
      >
        <div className="mx-1 text-sm">{soundChain.name}</div>
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
    )
  );
};
