// src/features/sequencer/components/LoopEditor.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTrackInfo,
  selectAllSteps,
  updateStepsForTrack,
  updateTrackInfo
} from '../slices/sequencerSlice';
import AppInput from '@/common/components/AppInput';

const LoopEditor: React.FC = () => {
  const dispatch = useDispatch();
  const allSteps = useSelector(selectAllSteps);
  const allTrackInfo = useSelector(selectTrackInfo);

  const [displayedSteps, setDisplayedSteps] = useState(16);

  const visibleSteps = useMemo(() => {
    return allTrackInfo.map(track => {
      const trackSteps = allSteps.filter(step => step.trackIndex === track.trackIndex);
      return Array.from({ length: displayedSteps }, (_, index) => {
        return trackSteps.find(s => s.stepIndex === index) ?? { active: false, trackIndex: track.trackIndex, stepIndex: index };
      });
    });
  }, [allSteps, allTrackInfo, displayedSteps]);

  const handleStepToggle = useCallback((trackIndex: number, stepIndex: number) => {
    const trackInfo = allTrackInfo[trackIndex];
    if (stepIndex > trackInfo.loopLength) return;

    const trackSteps = allSteps.filter(step => step.trackIndex === trackIndex);
    const newActive = !visibleSteps[trackIndex][stepIndex].active;

    const updatedSteps = trackSteps.map(step => {
      if (step.trackIndex === trackIndex && step.stepIndex % trackInfo.loopLength === stepIndex) {
        return { ...step, active: newActive };
      }
      return step;
    });

    dispatch(updateStepsForTrack({ trackIndex, updatedSteps }));
  }, [dispatch, allTrackInfo, allSteps, visibleSteps]);

  const handleLoopLengthChange = useCallback((trackIndex: number, value: string) => {
    const newLength = Math.max(1, Math.min(parseInt(value), displayedSteps));
    dispatch(updateTrackInfo({ trackIndex, loopLength: newLength }));
  }, [dispatch, displayedSteps]);

  const handleDisplayedStepsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayedSteps(Number(e.target.value));
  }, []);

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

      {visibleSteps.map((trackSteps, trackIndex) => (
        <div key={trackIndex} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Track {trackIndex + 1}</h4>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm">Loop Length:</label>
                <AppInput
                  type="number"
                  value={allTrackInfo[trackIndex].loopLength.toString()}
                  onChange={(e) => handleLoopLengthChange(trackIndex, e.target.value)}
                  min={1}
                  max={displayedSteps}
                  className="w-16 p-1 border rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            {trackSteps.map((step, stepIndex) => {
              const trackInfo = allTrackInfo[trackIndex];
              const isWithinLoop = stepIndex < trackInfo.loopLength;

              return (
                <div
                  key={stepIndex}
                  onClick={() => handleStepToggle(trackIndex, stepIndex)}
                  className={`
                    w-8 h-8 m-0.5 ring-1 ring-gray-600
                    ${isWithinLoop ? (step.active ? 'bg-blue-500' : 'bg-gray-400') : 'bg-gray-800'}
                    ${isWithinLoop ? 'cursor-pointer' : 'cursor-not-allowed'}
                    ${stepIndex === 0 ? 'border-l-4 border-green-500' : ''}
                    ${stepIndex === trackInfo.loopLength - 1 ? 'border-r-4 border-green-500' : ''}
                    ${(stepIndex + 1) % 4 === 0 ? 'mr-2' : ''}
                  `}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoopEditor;
