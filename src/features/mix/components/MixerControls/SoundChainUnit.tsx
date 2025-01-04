// src/features/mix/components/MixerControls/SoundChainUnit.tsx
import { useCallback, useEffect, useState, useRef } from "react";
import { useMixerTrackControls } from "../../hooks/useMixerTrackControls";
import { cn } from "@/common/shadcn/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { Knob } from "@/common/components/Knob/Knob";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useDeviceManager } from "@/features/mix/hooks/useDeviceManager";
import { DeviceType } from "../../types";

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
  } = useMixerTrackControls(soundChainId);
  const [localVolume, setLocalVolume] = useState(volume.toString());
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
      onClick={handleClick}
      className={cn(
        "flex h-full w-40 min-w-40 cursor-pointer flex-col px-1 py-2",
        className,
      )}
    >
      <div className="mx-1 h-fit">{soundChain?.name}</div>
      <div className="grid h-full grid-cols-2 bg-muted">
        <div className="relative overflow-hidden bg-muted-foreground">
          <div
            ref={meterRef}
            className="transition-width absolute left-0 top-0 h-full bg-primary duration-100"
            style={{ width: "0%" }}
          ></div>
        </div>
        <div className="grid grid-rows-4">
          <div className="row-span-1 flex w-full flex-col items-center pt-4">
            <Input
              type="number"
              value={localVolume}
              onChange={handleVolumeChange}
              className="input-no-wheel h-5 w-14 rounded-none bg-background px-0 py-1 text-center"
              min={0}
              step={0.01}
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
      <div className="flex flex-row justify-around">
        <Button size="sm" onClick={() => handleAddDevice("effect")}>
          Add Effect
        </Button>
        <Button size="sm" onClick={() => handleAddDevice("processor")}>
          Add Processor
        </Button>
        <Button size="sm" onClick={() => handleAddDevice("instrument")}>
          Add Instrument
        </Button>
      </div>
    </div>
  );
};
