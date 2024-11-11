// src/features/sequencer/components/LoopStepEditor.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTrackInfo,
  selectAllSteps,
  updateStepsForTrack,
  updateTrackInfo
} from '../slices/sequencerSlice';
import AppInput from '@/common/components/AppInput';

const LoopStepEditor: React.FC = () => {
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
    if (stepIndex > trackInfo.loopEnd) return;

    const { loopStart, loopEnd } = trackInfo;
    const loopLength = loopEnd - loopStart + 1;
    const trackSteps = allSteps.filter(step => step.trackIndex === trackIndex);
    const newActive = !visibleSteps[trackIndex][stepIndex].active;

    const updatedSteps = trackSteps.map(step => {
      if (step.trackIndex === trackIndex) {
        const relativeIndex = (step.stepIndex - loopStart + loopLength) % loopLength;
        if (relativeIndex === (stepIndex - loopStart + loopLength) % loopLength) {
          return { ...step, active: newActive };
        }
      }
      return step;
    });

    dispatch(updateStepsForTrack({ trackIndex, updatedSteps }));
  }, [dispatch, allTrackInfo, allSteps, visibleSteps]);


  const handleLoopStartChange = useCallback((trackIndex: number, value: string) => {
    const newStart = Math.max(0, Math.min(parseInt(value), allTrackInfo[trackIndex].loopEnd - 1));
    dispatch(updateTrackInfo({ trackIndex, loopStart: newStart }));
  }, [dispatch, allTrackInfo]);

  const handleLoopEndChange = useCallback((trackIndex: number, value: string) => {
    const newEnd = Math.max(allTrackInfo[trackIndex].loopStart + 1, Math.min(parseInt(value), displayedSteps - 1));
    dispatch(updateTrackInfo({ trackIndex, loopEnd: newEnd }));
  }, [dispatch, allTrackInfo, displayedSteps]);

  const handleDisplayedStepsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayedSteps(Number(e.target.value));
  }, []);

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

      {visibleSteps.map((trackSteps, trackIndex) => (
        <div key={trackIndex} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Track {trackIndex + 1}</h4>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm">Loop Start:</label>
                <AppInput
                  type="number"
                  value={allTrackInfo[trackIndex].loopStart.toString()}
                  onChange={(e) => handleLoopStartChange(trackIndex, e.target.value)}
                  min={0}
                  max={allTrackInfo[trackIndex].loopEnd - 1}
                  className="w-16 p-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Loop End:</label>
                <AppInput
                  type="number"
                  value={allTrackInfo[trackIndex].loopEnd.toString()}
                  onChange={(e) => handleLoopEndChange(trackIndex, e.target.value)}
                  min={allTrackInfo[trackIndex].loopStart + 1}
                  max={displayedSteps - 1}
                  className="w-16 p-1 border rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            {trackSteps.map((step, stepIndex) => {
              const trackInfo = allTrackInfo[trackIndex];
              const isWithinLoop = stepIndex >= trackInfo.loopStart && stepIndex <= trackInfo.loopEnd;
              const isPlaceholder = stepIndex > trackInfo.loopEnd;

              return (
                <div
                  key={stepIndex}
                  onClick={() => !isPlaceholder && handleStepToggle(trackIndex, stepIndex)}
                  className={`
                    w-8 h-8 m-1
                    ${isPlaceholder ? 'bg-gray-400 cursor-not-allowed' : (step.active ? 'bg-blue-500' : 'bg-gray-300')}
                    ${isPlaceholder ? '' : 'cursor-pointer'}
                    ${isWithinLoop ? 'ring-2 ring-green-500' : ''}
                    ${stepIndex === trackInfo.loopStart ? 'border-l-4 border-green-700' : ''}
                    ${stepIndex === trackInfo.loopEnd ? 'border-r-4 border-green-700' : ''}
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

export default LoopStepEditor;
