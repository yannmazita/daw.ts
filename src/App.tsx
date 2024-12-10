// src/App.tsx

import { Layout } from "@/common/components/Layout";
import { PlaybackControls } from "@/common/components/PlaybackControls/PlaybackControls";
import { ChannelRack } from "@/features/patterns/components/ChannelRack";

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <PlaybackControls />
        <ChannelRack />
      </div>
    </Layout>
  );
}

export default App;
