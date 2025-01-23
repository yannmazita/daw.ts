// src/common/components/DetailView.tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/shadcn/ui/tabs";

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
          <div className="p-4">Device View</div>
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
