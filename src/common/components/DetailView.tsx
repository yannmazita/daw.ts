// src/common/components/DetailView.tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/shadcn/ui/tabs";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { DeviceUnit } from "@/features/mix/components/MixerControls/DeviceUnit";

export const DetailView: React.FC = () => {
  const { devices, mixerTracks, soundChains } = useEngineStore(
    (state) => state.mix,
  );
  const parentId = "master"; // hardcoded for now
  const mixerTrack = mixerTracks[parentId];
  const soundChain = soundChains[parentId];
  const deviceIds = mixerTrack?.deviceIds ?? soundChain?.deviceIds ?? [];
  const filteredDevices = Object.values(devices).filter(
    (device) => device.parentId === parentId,
  );

  return (
    <div className="col-span-12 flex flex-col border border-border">
      <Tabs defaultValue="devices" className="h-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="clip">Clip</TabsTrigger>
        </TabsList>
        <TabsContent value="devices" className="h-full">
          <div className="flex flex-row gap-2 p-4">
            {filteredDevices.map((device) => (
              <DeviceUnit key={device.id} device={device} />
            ))}
          </div>
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
