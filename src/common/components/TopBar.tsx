// src/common/components/TopBar.tsx

import React from "react";
import PlaybackControls from "@/common/components/PlaybackControls/PlaybackControls";

export const TopBar: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-100 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <PlaybackControls />
      </div>
    </div>
  );
};
