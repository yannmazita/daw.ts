// SequencerSettings.tsx

import React, { useState } from 'react';
import AppInput from '@/common/components/AppInput';

// Mock store and manager
const structureStore = {
  state: { numTracks: 4, numSteps: 16 },
};
const playbackStore = {
  state: { bpm: 120 },
};
const trackManager = {
  setNumTracks: (num: number) => console.log(`Set num tracks: ${num}`),
  setNumSteps: (num: number) => console.log(`Set num steps: ${num}`),
};
const playbackManager = {
  setBpm: (bpm: number) => console.log(`Set BPM: ${bpm}`),
  setStepDuration: (duration: string) => console.log(`Set step duration: ${duration}`),
  setTimeSignature: (numerator: number, denominator: number) =>
    console.log(`Set time signature: ${numerator}/${denominator}`),
};

interface SequencerSettingsProps {
  className?: string;
}

const SequencerSettings: React.FC<SequencerSettingsProps> = ({ className }) => {
  const [inputTracks, setInputTracks] = useState(structureStore.state.numTracks.toString());
  const [inputSteps, setInputSteps] = useState(structureStore.state.numSteps.toString());
  const [inputBpm, setInputBpm] = useState(playbackStore.state.bpm.toString());
  const [stepDuration, setStepDuration] = useState('16n');
  const [timeSignature, setTimeSignature] = useState('4/4');

  const updateTracks = () => {
    const newTracks = parseInt(inputTracks);
    if (!isNaN(newTracks) && newTracks > 0) {
      trackManager.setNumTracks(newTracks);
    }
  };

  const updateSteps = () => {
    const newSteps = parseInt(inputSteps);
    if (!isNaN(newSteps) && newSteps > 0) {
      trackManager.setNumSteps(newSteps);
    }
  };

  const updateBpm = () => {
    const newBpm = parseInt(inputBpm);
    if (!isNaN(newBpm) && newBpm > 0) {
      playbackManager.setBpm(newBpm);
    }
  };

  const updateStepDuration = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStepDuration(e.target.value);
    playbackManager.setStepDuration(e.target.value);
  };

  const updateTimeSignature = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeSignature(e.target.value);
    const [numerator, denominator] = e.target.value.split('/').map(Number);
    playbackManager.setTimeSignature(numerator, denominator);
  };

  return (
    <div id="sequencer-settings-container" className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex flex-row justify-center">
        <div className="flex flex-row space-x-4">
          <div>
            <span>Tracks:</span>
            <AppInput
              value={inputTracks}
              onChange={(e) => setInputTracks(e.target.value)}
              onBlur={updateTracks}
              className="input input-bordered input-sm w-12 text-center"
            />
          </div>
          <div>
            <span>Steps:</span>
            <AppInput
              value={inputSteps}
              onChange={(e) => setInputSteps(e.target.value)}
              onBlur={updateSteps}
              className="input input-bordered input-sm w-12 text-center"
            />
          </div>
          <div>
            <span>BPM:</span>
            <AppInput
              value={inputBpm}
              onChange={(e) => setInputBpm(e.target.value)}
              onBlur={updateBpm}
              className="input input-bordered input-sm w-12 text-center"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <div>
          <span>Step Duration:</span>
          <select
            value={stepDuration}
            onChange={updateStepDuration}
            className="bg-gray-700 text-white px-2 py-1 rounded"
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
            value={timeSignature}
            onChange={updateTimeSignature}
            className="bg-gray-700 text-white px-2 py-1 rounded"
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SequencerSettings;
