// src/core/components/PlaybackControls/PlaybackControls.tsx

import React, { useCallback } from "react";
import { useSequencerPlayback } from "@/features/sequencer/hooks/useSequencerPlayback";
import { SequenceStatus } from "@/core/enums/sequenceStatus";
import PlaybackButton from "./PlaybackButton";
import StopButton from "./StopButton";
import StatusDisplay from "./StatusDisplay";

const PlaybackControls: React.FC = () => {
  const { startSequencer, stopSequencer, pauseSequencer, status } =
    useSequencerPlayback();

  const handlePlayPause = useCallback(async () => {
    if (status === SequenceStatus.Playing) {
      pauseSequencer();
    } else {
      await startSequencer();
    }
  }, [status, startSequencer, pauseSequencer]);

  return (
    <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-md">
      <PlaybackButton status={status} onClick={handlePlayPause} />
      <StopButton status={status} onClick={stopSequencer} />
      <StatusDisplay status={status} />
    </div>
  );
};

export default PlaybackControls;
