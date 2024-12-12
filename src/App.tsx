// src/App.tsx
import { Layout } from "@/common/components/Layout";
import { PlaybackControls } from "@/common/components/PlaybackControls/PlaybackControls";
import { SessionView } from "@/features/session/components/SessionView";

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <PlaybackControls />
        <SessionView className="h-[calc(100vh-12rem)]" />
      </div>
    </Layout>
  );
}

export default App;
