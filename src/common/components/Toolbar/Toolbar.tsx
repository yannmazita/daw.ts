// src/common/components/Toolbar/Toolbar.tsx
import { ViewSelector } from "./ViewSelector";
import { PlaybackControls } from "./PlaybackControls/PlaybackControls";

export const Toolbar = () => {
  return (
    <div className="flex items-center justify-between border-b border-border px-4">
      <ViewSelector />
      <PlaybackControls />
    </div>
  );
};
