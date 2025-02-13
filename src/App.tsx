// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { EngineManager } from "./core/engines/EngineManager";
import { TimelineGrid } from "./features/composition/components/TimelineGrid";
import { useEffect } from "react";
import { Browser } from "./features/browser/components/Browser";
import { DetailView } from "@/common/components/DetailView";
import { Mixer } from "./features/mix/components/Mixer/Mixer";
import { CustomContextMenu } from "@/common/components/CustomContextMenu";

export const App: React.FC = () => {
  const baseItems = [
    {
      id: "copy",
      type: "item" as const,
      label: "Copy",
      onClick: () => console.log("Copy clicked"),
    },
    {
      id: "sep1",
      type: "separator" as const,
    },
    {
      id: "share",
      type: "item" as const,
      label: "Share",
      onClick: () => console.log("Share clicked"),
    },
  ];

  useEffect(() => {
    EngineManager.getInstance();

    return () => {
      //EngineManager.getInstance().dispose();
    };
  }, []);

  return (
    <Layout>
      <div className="grid h-full grid-rows-4">
        <div className="row-span-3 grid grid-cols-12">
          <div className="col-span-3 flex flex-col overflow-hidden">
            <div className="grow overflow-hidden">
              <Browser />
            </div>
          </div>
          <div className="col-span-9 flex flex-col overflow-hidden">
            <div className="grow overflow-hidden">
              <TimelineGrid />
            </div>
            <Mixer />
          </div>
        </div>
        <div className="grid grid-cols-12">
          <DetailView />
        </div>
      </div>
    </Layout>
  );
};

export default App;
