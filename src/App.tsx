// src/App.tsx

import { Layout } from "@/common/components/Layout";
import { PlaybackControls } from "@/common/components/PlaybackControls/PlaybackControls";

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <PlaybackControls />
      </div>
    </Layout>
  );
}

export default App;
