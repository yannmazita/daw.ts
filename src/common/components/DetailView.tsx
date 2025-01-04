// src/common/components/DetailView.tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/shadcn/ui/tabs";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { DeviceUnit } from "@/features/mix/components/MixerControls/DeviceUnit";
import { useDeviceManager } from "@/features/mix/hooks/useDeviceManager";
import { useMemo } from "react";

interface DetailViewProps {
  selectedParentId: string | null;
}

export const DetailView: React.FC<DetailViewProps> = ({ selectedParentId }) => {
  return (
    <div className="col-span-12 flex flex-col border border-border">
      <Tabs defaultValue="devices" className="h-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="clip">Clip</TabsTrigger>
        </TabsList>
        <TabsContent value="devices" className="h-full">
          <DeviceTabContent selectedParentId={selectedParentId} />
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

interface DeviceTabContentProps {
  selectedParentId: string | null;
}

const DeviceTabContent: React.FC<DeviceTabContentProps> = ({
  selectedParentId,
}) => {
  const { devices } = useEngineStore((state) => state.mix);
  const { addDevice, updateDevice, removeDevice } =
    useDeviceManager(selectedParentId);

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
