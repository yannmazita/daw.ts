// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { EngineManager } from "./core/engines/EngineManager";
import { TimelineGrid } from "./features/arrangement/components/TimelineGrid";
import { useEffect } from "react";

export const App: React.FC = () => {
  useEffect(() => {
    EngineManager.getInstance();

    return () => {
      //EngineManager.getInstance().dispose();
    };
  }, []);
  return (
    <Layout>
      <div className="flex h-full flex-col">
        <TimelineGrid />
      </div>
    </Layout>
  );
};

export default App;
