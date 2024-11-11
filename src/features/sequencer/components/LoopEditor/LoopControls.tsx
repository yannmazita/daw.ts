// src/features/sequencer/components/LoopEditor/LoopControls.tsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { updateTrackInfo } from '../../slices/sequencerSlice';
import { SequencerTrackInfo } from '@/core/interfaces/sequencer';
import AppInput from '@/common/components/AppInput';

interface LoopControlsProps {
  trackInfo: SequencerTrackInfo;
  displayedSteps: number;
}

const LoopControls: React.FC<LoopControlsProps> = ({ trackInfo, displayedSteps }) => {
  const dispatch = useDispatch();

  const handleLoopLengthChange = (value: string) => {
    const newLength = Math.max(1, Math.min(parseInt(value), displayedSteps));
    dispatch(updateTrackInfo({ trackIndex: trackInfo.trackIndex, loopLength: newLength }));
  };

  return (
    <div className="flex space-x-4 mb-2">
      <div>
        <label className="block text-sm">Loop Length:</label>
        <AppInput
          type="number"
          value={trackInfo.loopLength.toString()}
          onChange={(e) => handleLoopLengthChange(e.target.value)}
          min={1}
          max={displayedSteps}
          className="w-16 p-1 border rounded"
        />
      </div>
    </div>
  );
};

export default LoopControls;
