// src/features/sequencer/components/LoopEditor/LoopControls.tsx

import React, { useCallback } from "react";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { SequencerTrackInfo } from "@/core/interfaces/sequencer";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";

interface LoopControlsProps {
  trackInfo: SequencerTrackInfo;
  displayedSteps: number;
}

const LoopControls: React.FC<LoopControlsProps> = ({
  trackInfo,
  displayedSteps,
}) => {
  const updateTrackInfoAndSteps = useSequencerStore(
    (state) => state.updateTrackInfoAndSteps,
  );

  const handleLoopLengthChange = useCallback(
    (value: string) => {
      const newLength = Math.max(
        1,
        Math.min(parseInt(value) || 1, displayedSteps),
      );

      // Only update if the value has actually changed
      if (newLength !== trackInfo.loopLength) {
        updateTrackInfoAndSteps({
          trackIndex: trackInfo.trackIndex,
          loopLength: newLength,
        });
      }
    },
    [
      trackInfo.trackIndex,
      trackInfo.loopLength,
      displayedSteps,
      updateTrackInfoAndSteps,
    ],
  );

  return (
    <div className="flex space-x-4 mb-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor={`loopLength-${trackInfo.trackIndex}`}>
          Loop Length
        </Label>
        <Input
          type="number"
          id={`loopLength-${trackInfo.trackIndex}`}
          value={trackInfo.loopLength.toString()}
          onChange={(e) => handleLoopLengthChange(e.target.value)}
          min={1}
          max={displayedSteps}
          className="w-16"
        />
      </div>
    </div>
  );
};

export default LoopControls;
