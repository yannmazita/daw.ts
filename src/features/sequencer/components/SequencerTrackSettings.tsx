// src/features/sequencer/components/SequencerTrackSettings.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTrackInfo,
  selectGlobalBpm,
  updateTrackInfoAndSteps,
  setGlobalBpm
} from '../slices/sequencerSlice';
import LoopEditor from './LoopEditor/LoopEditor';
import { Input } from '@/common/shadcn/ui/input';
import { Label } from '@/common/shadcn/ui/label';

interface SequencerTrackSettingsProps {
  className?: string;
}

const SequencerTrackSettings: React.FC<SequencerTrackSettingsProps> = ({ className }) => {
  const dispatch = useDispatch();
  const trackInfo = useSelector(selectTrackInfo);
  const globalBpm = useSelector(selectGlobalBpm);

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const selectedTrack = trackInfo[selectedTrackIndex];

  const handleBpmChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value);
    if (!isNaN(newBpm) && newBpm > 0) {
      dispatch(setGlobalBpm(newBpm));
    }
  }, [dispatch]);

  const handleTrackChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrackIndex(parseInt(e.target.value));
  }, []);

  const handleTimeSignatureChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [numerator, denominator] = e.target.value.split('/').map(Number);
    dispatch(updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      timeSignature: [numerator, denominator]
    }));
  }, [dispatch, selectedTrackIndex]);

  const handleStepDurationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      stepDuration: e.target.value
    }));
  }, [dispatch, selectedTrackIndex]);

  const stepsPerMeasure = useMemo(() => {
    if (selectedTrack) {
      return selectedTrack.stepsPerMeasure;
    }
    return 0;
  }, [selectedTrack]);

  return (
    <div className={`${className} p-4 bg-slate-50`}>
      <h2 className="text-xl font-bold mb-4">Track Settings</h2>

      <div className="mb-4">
        <label className="block mb-2">Select Track:</label>
        <select
          value={selectedTrackIndex}
          onChange={handleTrackChange}
          className="w-full p-2 border rounded"
        >
          {trackInfo.map((info, index) => (
            <option key={info.trackIndex} value={index}>
              Track {info.trackIndex + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <Label htmlFor="globalBpm">Global BPM</Label>
        <Input type="number" id="globalBpm" value={globalBpm.toString()} onChange={handleBpmChange} min={1} />
      </div>

      {selectedTrack && (
        <>
          <div className="mb-4">
            <Label htmlFor="timeSignature">Time Signature</Label>
            <select
              value={`${selectedTrack.timeSignature[0]}/${selectedTrack.timeSignature[1]}`}
              onChange={handleTimeSignatureChange}
              className="w-full p-2 border rounded"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="5/4">5/4</option>
              <option value="7/8">7/8</option>
            </select>
          </div>

          <div className="mb-4">
            <Label htmlFor="stepDuration">Step Duration</Label>
            <select
              value={selectedTrack.stepDuration}
              onChange={handleStepDurationChange}
              className="w-full p-2 border rounded"
            >
              <option value="1n">Whole Note</option>
              <option value="2n">Half Note</option>
              <option value="4n">Quarter Note</option>
              <option value="8n">Eighth Note</option>
              <option value="16n">Sixteenth Note</option>
              <option value="32n">Thirty-Second Note</option>
            </select>
          </div>
          <div className="mb-4">
            <Label htmlFor="stepsPerMeasure">Steps per Measure: </Label>
            <span className="font-bold">{stepsPerMeasure}</span>
          </div>
          <LoopEditor />
        </>
      )}
    </div>
  );
};

export default SequencerTrackSettings;
