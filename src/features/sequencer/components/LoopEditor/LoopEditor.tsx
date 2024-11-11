// src/features/sequencer/components/LoopEditor/LoopEditor.tsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTrackInfo } from '../../slices/sequencerSlice';
import TrackEditor from './TrackEditor';

const LoopEditor: React.FC = () => {
  const allTrackInfo = useSelector(selectTrackInfo);
  const [displayedSteps, setDisplayedSteps] = useState(16);

  const handleDisplayedStepsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayedSteps(Number(e.target.value));
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Loop Editor</h3>

      <div className="mb-4">
        <label className="block mb-2">Displayed Steps:</label>
        <select
          value={displayedSteps}
          onChange={handleDisplayedStepsChange}
          className="w-full p-2 border rounded"
        >
          <option value="8">8 steps</option>
          <option value="16">16 steps</option>
          <option value="32">32 steps</option>
          <option value="64">64 steps</option>
        </select>
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
