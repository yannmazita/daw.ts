// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { EngineManager } from "./core/engines/EngineManager";
import { TimelineGrid } from "./features/composition/components/TimelineGrid";
import { useEffect, useState } from "react";
import { Browser } from "./features/browser/components/Browser";
import { DetailView } from "@/common/components/DetailView";
import { Mixer } from "./features/mix/components/Mixer/Mixer";

export const App: React.FC = () => {
  useEffect(() => {
    EngineManager.getInstance();

    return () => {
      //EngineManager.getInstance().dispose();
    };
  }, []);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    "master",
  );

  const handleSelectParent = (parentId: string) => {
    setSelectedParentId(parentId);
  };
  return (
    <Layout>
      <div className="grid h-full grid-rows-4">
        <div className="row-span-3 grid grid-cols-12">
          <Browser />
          <div className="col-span-9 flex flex-col overflow-hidden">
            <div className="flex-grow overflow-hidden">
              <TimelineGrid />
            </div>
            <Mixer onSelectParent={handleSelectParent} />
          </div>
        </div>
        <div className="grid grid-cols-12">
          <DetailView selectedParentId={selectedParentId} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
