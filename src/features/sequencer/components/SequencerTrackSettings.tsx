// src/features/sequencer/components/SequencerTrackSettings.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useSequencerStore } from '../slices/useSequencerStore';
import { Input } from '@/common/shadcn/ui/input';
import { Label } from '@/common/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select"

const SequencerTrackSettings: React.FC = () => {
  const allTrackInfo = useSequencerStore(state => state.trackInfo);
  const globalBpm = useSequencerStore(state => state.globalBpm);
  const setGlobalBpm = useSequencerStore(state => state.setGlobalBpm);
  const updateTrackInfoAndSteps = useSequencerStore(state => state.updateTrackInfoAndSteps);

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const selectedTrack = allTrackInfo[selectedTrackIndex];

  const handleBpmChange = useCallback((value: string) => {
    setGlobalBpm(parseInt(value));
  }, []);

  const handleTrackChange = useCallback((value: string) => {
    setSelectedTrackIndex(parseInt(value));
  }, []);

  const handleTimeSignatureChange = useCallback((value: string) => {
    const [numerator, denominator] = value.split('/').map(Number);
    updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      timeSignature: [numerator, denominator]
    });
  }, [selectedTrackIndex]);

  const handleStepDurationChange = useCallback((value: string) => {
    updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      stepDuration: value
    });
  }, [selectedTrackIndex]);

  const stepsPerMeasure = useMemo(() => {
    if (selectedTrack) {
      return selectedTrack.stepsPerMeasure;
    }
    return 0;
  }, [selectedTrack]);

  return (
    <div className="bg-slate-50 p-2 col-span-1">
      <h3 className="text-lg font-bold mb-4">Track Settings</h3>

      <div className="mb-4">
        <Label htmlFor="trackSelect">Select Track</Label>
        <Select onValueChange={handleTrackChange} value={selectedTrackIndex.toString()}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a track" />
          </SelectTrigger>
          <SelectContent>
            {allTrackInfo.map((info, index) => (
              <SelectItem key={info.trackIndex} value={index.toString()}>
                Track {info.trackIndex + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label htmlFor="globalBpm">Global BPM</Label>
        <Input type="number" id="globalBpm" value={globalBpm.toString()} onChange={(e) => handleBpmChange(e.target.value)} min={1} />
      </div>

      {selectedTrack && (
        <>
          <div className="mb-4">
            <Label htmlFor={`timeSignature-track-${selectedTrackIndex}`}>Time Signature</Label>
            <Select onValueChange={handleTimeSignatureChange} value={`${selectedTrack.timeSignature[0]}/${selectedTrack.timeSignature[1]}`}>
              <SelectTrigger className="w-full">
                <SelectValue id={`timeSignature-track-${selectedTrackIndex}`} placeholder="Select time signature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="5/4">5/4</SelectItem>
                <SelectItem value="7/8">7/8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor={`stepDuration-track-${selectedTrackIndex}`}>Step Duration</Label>
            <Select onValueChange={handleStepDurationChange} value={selectedTrack.stepDuration}>
              <SelectTrigger className="w-full">
                <SelectValue id={`stepDuration-track-${selectedTrackIndex}`} placeholder="Select step duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1n">Whole Note</SelectItem>
                <SelectItem value="2n">Half Note</SelectItem>
                <SelectItem value="4n">Quarter Note</SelectItem>
                <SelectItem value="8n">Eighth Note</SelectItem>
                <SelectItem value="16n">Sixteenth Note</SelectItem>
                <SelectItem value="32n">Thirty-Second Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="steps-per-measure">Steps per Measure: </Label>
            <span id="steps-per-measure" className="font-bold">{stepsPerMeasure}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SequencerTrackSettings;
