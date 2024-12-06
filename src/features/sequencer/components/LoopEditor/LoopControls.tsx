// src/features/sequencer/components/LoopEditor/LoopControls.tsx

import React, { useCallback } from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { StepSequenceData } from "@/core/interfaces/pattern";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import { Slider } from "@/common/shadcn/ui/slider";
import { Note } from "@/core/enums/note";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { PatternTrackType } from "@/core/enums/PatternTrackType";

interface LoopControlsProps {
  trackId: string;
  patternId: string;
  displayedSteps: number;
}

const LoopControls: React.FC<LoopControlsProps> = ({
  trackId,
  patternId,
  displayedSteps,
}) => {
  const updatePatternData = usePatternStore((state) => state.updatePatternData);
  const track = usePatternStore((state) =>
    state.patterns
      .find((p) => p.id === patternId)
      ?.tracks.find((t) => t.id === trackId),
  );

  if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) {
    return null;
  }

  const stepData = track.data as StepSequenceData;

  const handleLoopLengthChange = useCallback(
    (value: string) => {
      const newLength = Math.max(
        1,
        Math.min(parseInt(value) || 1, displayedSteps),
      );

      if (newLength !== stepData.loopLength) {
        updatePatternData(patternId, trackId, {
          ...stepData,
          loopLength: newLength,
        });
      }
    },
    [patternId, trackId, stepData, displayedSteps, updatePatternData],
  );

  const handleDefaultNoteChange = useCallback(
    (note: Note) => {
      updatePatternData(patternId, trackId, {
        ...stepData,
        defaultNote: note,
      });
    },
    [patternId, trackId, stepData, updatePatternData],
  );

  const handleDefaultVelocityChange = useCallback(
    (value: number) => {
      updatePatternData(patternId, trackId, {
        ...stepData,
        defaultVelocity: value,
      });
    },
    [patternId, trackId, stepData, updatePatternData],
  );

  return (
    <div className="flex space-x-4 mb-2">
      <div className="grid items-center gap-1.5">
        <Label htmlFor={`loopLength-${trackId}`}>Loop Length</Label>
        <Input
          type="number"
          id={`loopLength-${trackId}`}
          value={stepData.loopLength.toString()}
          onChange={(e) => handleLoopLengthChange(e.target.value)}
          min={1}
          max={displayedSteps}
          className="w-16"
        />
      </div>

      <div className="grid items-center gap-1.5">
        <Label>Default Note</Label>
        <Select
          value={stepData.defaultNote}
          onValueChange={handleDefaultNoteChange}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Select note" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Note).map((note) => (
              <SelectItem key={note} value={note}>
                {note}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid items-center gap-1.5">
        <Label>Default Velocity</Label>
        <Slider
          value={[stepData.defaultVelocity]}
          min={0}
          max={127}
          step={1}
          onValueChange={([value]) => handleDefaultVelocityChange(value)}
          className="w-32"
        />
      </div>
    </div>
  );
};

export default LoopControls;
