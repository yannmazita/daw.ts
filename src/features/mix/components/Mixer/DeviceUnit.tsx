// src/features/mix/components/Mixer/DeviceUnit.tsx
import { Button } from "@/common/shadcn/ui/button";
import { cn } from "@/common/shadcn/lib/utils";
import { Device } from "../../types";
import { useDeviceManager } from "../../hooks/useDeviceManager";

interface DeviceUnitProps {
  device: Device;
}

export const DeviceUnit: React.FC<DeviceUnitProps> = ({ device }) => {
  const { updateDevice } = useDeviceManager(device.parentId);

  const handleBypass = () => {
    updateDevice(device.id, {
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
