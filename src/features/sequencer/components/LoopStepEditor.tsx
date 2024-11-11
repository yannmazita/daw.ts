// src/features/sequencer/components/LoopStepEditor.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectStepsByTrack,
  selectTrackInfo,
  updateStepsForTrack,
  updateTrackInfo
} from '../slices/sequencerSlice';
import AppInput from '@/common/components/AppInput';

interface LoopStepEditorProps {
  trackIndex: number;
}

const LoopStepEditor: React.FC<LoopStepEditorProps> = ({ trackIndex }) => {
  const dispatch = useDispatch();
  const steps = useSelector(selectStepsByTrack(trackIndex));
  const trackInfo = useSelector(selectTrackInfo)[trackIndex];

  const [displayedSteps, setDisplayedSteps] = useState(16);

  useEffect(() => {
    setDisplayedSteps(16);
  }, [trackIndex]);

  const visibleSteps = useMemo(() => {
    return Array.from({ length: displayedSteps }, (_, index) => {
      return steps.find(s => s.stepIndex === index) ?? { active: false, trackIndex, stepIndex: index };
    });
  }, [steps, displayedSteps, trackIndex]);

  const handleStepToggle = useCallback((stepIndex: number) => {
    if (stepIndex > trackInfo.loopEnd) return;

    const { loopStart, loopEnd } = trackInfo;
    const loopLength = loopEnd - loopStart + 1;
    const newActive = !visibleSteps[stepIndex].active;

    const updatedSteps = [...steps];  // Create a copy of the current steps

    // Update existing steps
    for (let i = loopStart; i <= loopEnd; i++) {
      const relativeIndex = (i - loopStart + loopLength) % loopLength;
      if (relativeIndex === (stepIndex - loopStart + loopLength) % loopLength) {
        const existingStepIndex = updatedSteps.findIndex(s => s.stepIndex === i && s.trackIndex === trackIndex);
        if (existingStepIndex !== -1) {
          updatedSteps[existingStepIndex] = { ...updatedSteps[existingStepIndex], active: newActive };
        } 
      }
    }

    dispatch(updateStepsForTrack({ trackIndex, updatedSteps }));
  }, [dispatch, trackIndex, steps, trackInfo, visibleSteps]);


  const handleLoopStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === '') {
      return;
    }
    const newStart = parseInt(value);
    if (!isNaN(newStart)) {
      const validNewStart = Math.max(0, Math.min(newStart, trackInfo.loopEnd - 1));
      dispatch(updateTrackInfo({ trackIndex, loopStart: validNewStart }));
    }
  }, [dispatch, trackIndex, trackInfo.loopEnd]);

  const handleLoopEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === '') {
      return;
    }
    const newEnd = parseInt(value);
    if (!isNaN(newEnd)) {
      const validNewEnd = Math.max(trackInfo.loopStart + 1, Math.min(newEnd, displayedSteps - 1));
      dispatch(updateTrackInfo({ trackIndex, loopEnd: validNewEnd }));
    }
  }, [dispatch, trackIndex, trackInfo.loopStart, displayedSteps]);

  const handleDisplayedStepsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDisplayedSteps = parseInt(e.target.value);
    setDisplayedSteps(newDisplayedSteps);

    // Adjust loop end if it's beyond the new displayed steps
    if (trackInfo.loopEnd >= newDisplayedSteps) {
      dispatch(updateTrackInfo({ trackIndex, loopEnd: newDisplayedSteps - 1 }));
    }
  }, [dispatch, trackIndex, trackInfo.loopEnd]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Loop Step Editor</h3>

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

      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block mb-2">Loop Start:</label>
          <AppInput
            type="number"
            value={trackInfo.loopStart.toString()}
            onChange={handleLoopStartChange}
            min={0}
            max={trackInfo.loopEnd - 1}
            className="w-20 p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Loop End:</label>
          <AppInput
            type="number"
            value={trackInfo.loopEnd.toString()}
            onChange={handleLoopEndChange}
            min={trackInfo.loopStart + 1}
            max={steps.length - 1}
            className="w-20 p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex flex-wrap">
        {visibleSteps.map((step, index) => {
          const isWithinLoop = index >= trackInfo.loopStart && index <= trackInfo.loopEnd;
          const isPlaceholder = index > trackInfo.loopEnd;

          return (
            <div
              key={index}
              onClick={() => !isPlaceholder && handleStepToggle(index)}
              className={`
                w-8 h-8 m-1 transition-all duration-150
                ${isPlaceholder ? 'bg-gray-400 cursor-not-allowed' : (step.active ? 'bg-blue-500' : 'bg-gray-300')}
                ${isPlaceholder ? '' : 'cursor-pointer'}
                ${isWithinLoop ? 'ring-2 ring-green-500' : ''}
                ${index === trackInfo.loopStart ? 'border-l-4 border-green-700' : ''}
                ${index === trackInfo.loopEnd ? 'border-r-4 border-green-700' : ''}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LoopStepEditor;
