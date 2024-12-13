// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { Toolbar } from "@/common/components/Toolbar/Toolbar";
import { Workspace } from "@/common/components/Workspace/Workspace";

function App() {
  return (
    <Layout>
      <div className="flex h-full flex-col">
        <Toolbar />
        <Workspace />
      </div>
    </Layout>
  );
}

export default App;
