// src/features/mix/components/MixerControls/DeviceUnit.tsx
import { Button } from "@/common/shadcn/ui/button";
import { cn } from "@/common/shadcn/lib/utils";
import { useMixEngine } from "@/core/engines/EngineManager";
import { Device } from "../../types";

interface DeviceUnitProps {
  device: Device;
}

export const DeviceUnit: React.FC<DeviceUnitProps> = ({ device }) => {
  const mixEngine = useMixEngine();

  const handleBypass = () => {
    mixEngine.updateDevice(device.parentId, device.id, {
      bypass: !device.bypass,
    });
  };

  return (
    <div className="flex flex-col items-center border border-border p-2">
      <div className="text-sm font-medium">{device.name}</div>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "mt-2 rounded-none py-1",
          device.bypass ? "bg-muted-foreground dark:text-background" : "",
        )}
        onClick={handleBypass}
      >
        {device.bypass ? "Bypassed" : "Active"}
      </Button>
    </div>
  );
};
