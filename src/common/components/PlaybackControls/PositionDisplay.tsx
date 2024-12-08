// src/common/components/PlaybackControls/PositionDisplay.tsx

import { useStore } from "@/common/slices/useStore";
import { useEffect, useState } from "react";
import * as Tone from "tone";

export function PositionDisplay() {
  const { isPlaying, position } = useStore();
  const [displayPosition, setDisplayPosition] = useState("0:0:0");

  useEffect(() => {
    let intervalId: number;

    if (isPlaying) {
      intervalId = window.setInterval(() => {
        const pos = Tone.getTransport().position.toString();
        setDisplayPosition(pos);
      }, 16); // ~60fps
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Position
      </span>
      <div className="rounded bg-slate-300 px-2 py-1 font-mono dark:bg-slate-700">
        {displayPosition}
      </div>
    </div>
  );
}
