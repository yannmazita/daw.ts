// src/common/components/DetailView.tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/shadcn/ui/tabs";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useUIStore } from "@/core/stores/useUIStore";
import { DeviceUnit } from "@/features/mix/components/Mixer/DeviceUnit";
import { useMemo } from "react";

export const DetailView: React.FC = () => {
  return (
    <div className="col-span-12 flex flex-col border border-border">
      <Tabs defaultValue="devices" className="h-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="clip">Clip</TabsTrigger>
        </TabsList>
        <TabsContent value="devices" className="h-full">
          <DeviceTabContent />
        </TabsContent>
        <TabsContent value="automation" className="h-full">
          <div className="p-4">Automation View</div>
        </TabsContent>
        <TabsContent value="clip" className="h-full">
          <div className="p-4">Clip View</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DeviceTabContent: React.FC = () => {
  const { clickedComponentId } = useUIStore();
  const { devices } = useEngineStore((state) => state.mix);

  const selectedParentId = clickedComponentId;

  const filteredDevices = useMemo(() => {
    return Object.values(devices).filter(
      (device) => device.parentId === selectedParentId,
    );
  }, [devices, selectedParentId]);

  return (
    <div className="flex flex-row gap-2 p-4">
      {filteredDevices.map((device) => (
        <DeviceUnit key={device.id} device={device} />
      ))}
    </div>
  );
};
