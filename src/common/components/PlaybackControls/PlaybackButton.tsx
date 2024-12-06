// src/common/components/PlaybackControls/PlaybackButton.tsx

import React from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { SequenceStatus } from "@/core/enums/sequenceStatus";
import { PlayIcon, PauseIcon } from "./icons";

interface PlaybackButtonProps {
  status: SequenceStatus;
  onClick: () => void;
}

const PlaybackButton: React.FC<PlaybackButtonProps> = ({ status, onClick }) => {
  const isPlaying = status === SequenceStatus.Playing;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        isPlaying
          ? "bg-yellow-500 hover:bg-yellow-600"
          : "bg-green-500 hover:bg-green-600",
      )}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <PauseIcon className="w-5 h-5 text-white" />
      ) : (
        <PlayIcon className="w-5 h-5 text-white ml-0.5" />
      )}
    </button>
  );
};

export default React.memo(PlaybackButton);
