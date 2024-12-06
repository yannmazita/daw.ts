// src/features/sequencer/components/LoopEditor/LoopEditor.tsx

import React, { useMemo, useState } from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { useSequencerStore } from "../../slices/useSequencerStore";
import TrackEditor from "./TrackEditor";
import { Label } from "@/common/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";

const LoopEditor: React.FC = () => {
  const currentPatternId = useSequencerStore((state) => state.currentPatternId);
  const currentPattern = usePatternStore((state) =>
    state.patterns.find((p) => p.id === currentPatternId),
  );
  const [displayedSteps, setDisplayedSteps] = useState(16);

  const handleDisplayedStepsChange = (value: string) => {
    setDisplayedSteps(parseInt(value));
  };

  const trackEditors = useMemo(() => {
    if (!currentPattern) return null;

    return currentPattern.tracks.map((track) => (
      <TrackEditor
        key={track.id}
        trackId={track.id}
        patternId={currentPattern.id}
        displayedSteps={displayedSteps}
      />
    ));
  }, [currentPattern, displayedSteps]);

  if (!currentPattern) {
    return (
      <div className="bg-slate-50 p-2 col-span-2 text-center text-gray-500">
        No pattern selected
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-2 col-span-2">
      <h3 className="text-lg font-semibold mb-4">Loop Editor</h3>

      <div className="mb-4">
        <Label htmlFor="displayed-steps">Displayed Steps</Label>
        <Select
          onValueChange={handleDisplayedStepsChange}
          value={`${displayedSteps}`}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              id="displayed-steps"
              placeholder="Select displayed steps"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8 steps</SelectItem>
            <SelectItem value="16">16 steps</SelectItem>
            <SelectItem value="32">32 steps</SelectItem>
            <SelectItem value="64">64 steps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">{trackEditors}</div>
      </div>
    </div>
  );
};

export default LoopEditor;
