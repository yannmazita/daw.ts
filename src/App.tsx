// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { EngineManager } from "./core/engines/EngineManager";
import { TimelineGrid } from "./features/composition/components/TimelineGrid";
import { useEffect } from "react";
import { Browser } from "./features/browser/components/Browser";
import { DetailView } from "./common/components/DetailView";
import { MixerControls } from "./features/mix/components/MixerControls/MixerControls";

export const App: React.FC = () => {
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
          <Browser />
          <div className="col-span-9 flex flex-col overflow-hidden">
            <div className="flex-grow overflow-hidden">
              <TimelineGrid />
            </div>
            <MixerControls />
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
