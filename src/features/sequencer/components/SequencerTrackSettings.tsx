// src/features/components/SequencerTrackSettings.tsx

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTrackInfo,
  selectGlobalBpm,
  updateTrackInfoAndSteps,
  setGlobalBpm
} from '../slices/sequencerSlice';
import AppInput from '@/common/components/AppInput';

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

  const handleStepDurationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      stepDuration: e.target.value
    }));
  }, [dispatch, selectedTrackIndex]);

  const handleTimeSignatureChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [numerator, denominator] = e.target.value.split('/').map(Number);
    dispatch(updateTrackInfoAndSteps({
      trackIndex: selectedTrackIndex,
      timeSignature: [numerator, denominator]
    }));
  }, [dispatch, selectedTrackIndex]);

  return (
    <div id='sequencer-track-settings-wrapper' className={`${className} flex flex-col space-y-4 bg-blue-800 p-4`}>
      <div>
        <label>Select Track:</label>
        <select
          value={selectedTrackIndex}
          onChange={(e) => setSelectedTrackIndex(parseInt(e.target.value))}
          className="bg-gray-700 text-white px-2 py-1 rounded ml-2"
        >
          {trackInfo.map((track, index) => (
            <option key={track.trackIndex} value={index}>Track {track.trackIndex + 1}</option>
          ))}
        </select>
      </div>

      <div>
        <span>Global BPM:</span>
        <AppInput
          value={globalBpm.toString()}
          onChange={handleBpmChange}
          className="input input-bordered input-sm w-20 text-center ml-2"
          type="number"
        />
      </div>

      {selectedTrack && (
        <>
          <div>
            <span>Step Duration:</span>
            <select
              value={selectedTrack.stepDuration}
              onChange={handleStepDurationChange}
              className="bg-gray-700 text-white px-2 py-1 rounded ml-2"
            >
              <option value="4n">Quarter Note</option>
              <option value="8n">Eighth Note</option>
              <option value="16n">Sixteenth Note</option>
              <option value="32n">Thirty-Second Note</option>
            </select>
          </div>

          <div>
            <span>Time Signature:</span>
            <select
              value={`${selectedTrack.timeSignature[0]}/${selectedTrack.timeSignature[1]}`}
              onChange={handleTimeSignatureChange}
              className="bg-gray-700 text-white px-2 py-1 rounded ml-2"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default SequencerTrackSettings;
