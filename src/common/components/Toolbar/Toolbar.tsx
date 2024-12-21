// src/common/components/Toolbar/Toolbar.tsx
import { ViewSelector } from "./ViewSelector";
import { PlaybackControls } from "@/features/transport/components/PlaybackControls/PlaybackControls";

export const Toolbar = () => {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 dark:border-b dark:border-border">
      <ViewSelector />
      <div className="flex flex-grow justify-center">
        {/*<PlaybackControls />*/}
      </div>
    </div>
  );
};
