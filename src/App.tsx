// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { Toolbar } from "@/common/components/Toolbar/Toolbar";
import { Workspace } from "@/common/components/Workspace/Workspace";
import { EngineManager } from "./core/engines/EngineManager";
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
        <Toolbar />
        <Workspace />
      </div>
    </Layout>
  );
};

export default App;
