// src/features/sequencer/components/LoopEditor/LoopEditor.tsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo } from '../../slices/sequencerSlice';
import TrackEditor from './TrackEditor';
import { Label } from '@/common/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select"

const LoopEditor: React.FC = () => {
  const allTrackInfo = useSelector(selectTrackInfo);
  const [displayedSteps, setDisplayedSteps] = useState(16);

  const handleDisplayedStepsChange = (value: string) => {
    setDisplayedSteps(parseInt(value));
  };

  return (
    <div className="px-3 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Loop Editor</h3>

      <div className="mb-4">
        <Label htmlFor="displayed-steps">Displayed Steps</Label>
        <Select onValueChange={handleDisplayedStepsChange} value={`${displayedSteps}`}>
          <SelectTrigger className="w-full">
            <SelectValue id="displayed-steps" placeholder="Select displayed steps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8 steps</SelectItem>
            <SelectItem value="16">16 steps</SelectItem>
            <SelectItem value="32">32 steps</SelectItem>
            <SelectItem value="64">64 steps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {allTrackInfo.map((trackInfo) => (
        <TrackEditor
          key={trackInfo.trackIndex}
          trackInfo={trackInfo}
          displayedSteps={displayedSteps}
        />
      ))}
    </div>
  );
};

export default LoopEditor;
