// src/features/sequencer/components/PlaybackControls/StopButton.tsx

import React from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { SequenceStatus } from "@/core/enums/sequenceStatus";
import { StopIcon } from "./icons";

interface StopButtonProps {
  status: SequenceStatus;
  onClick: () => void;
}

const StopButton: React.FC<StopButtonProps> = ({ status, onClick }) => {
  const isStopped = status === SequenceStatus.Stopped;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "bg-red-500 hover:bg-red-600",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        isStopped && "opacity-50 cursor-not-allowed",
      )}
      disabled={isStopped}
      aria-label="Stop"
    >
      <StopIcon className="w-5 h-5 text-white" />
    </button>
  );
};

export default React.memo(StopButton);
