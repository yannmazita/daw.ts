// src/features/sequencer/components/SequencerTrackSettings.tsx

import React, { useState, useCallback } from "react";
import { useSequencerStore } from "../slices/useSequencerStore";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { InstrumentName } from "@/core/enums/instrumentName";
import { StepSequenceData } from "@/core/interfaces/pattern";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";

const SequencerTrackSettings: React.FC = () => {
  const currentPatternId = useSequencerStore((state) => state.currentPatternId);
  const globalBpm = useSequencerStore((state) => state.transport.bpm);
  const setBpm = useSequencerStore((state) => state.setBpm);

  const { patterns, updatePatternData } = usePatternStore();
  const currentPattern = patterns.find((p) => p.id === currentPatternId);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    currentPattern?.tracks[0]?.id ?? null,
  );

  const selectedTrack = currentPattern?.tracks.find(
    (t) => t.id === selectedTrackId,
  );

  const handleBpmChange = useCallback(
    (value: string) => {
      setBpm(parseInt(value));
    },
    [setBpm],
  );

  const handleTrackChange = useCallback((value: string) => {
    setSelectedTrackId(value);
  }, []);

  const handleInstrumentChange = useCallback(
    (value: string) => {
      if (!currentPattern || !selectedTrackId) return;

      const track = currentPattern.tracks.find((t) => t.id === selectedTrackId);
      if (!track) return;

      // Create new instrument and connect to existing mixer channel
      instrumentManager.addInstrument(
        track.instrumentId,
        value as InstrumentName,
        track.mixerChannelId,
      );

      updatePatternData(currentPattern.id, selectedTrackId, {
        ...track.data,
        instrumentName: value as InstrumentName,
      });
    },
    [currentPattern, selectedTrackId, updatePatternData],
  );

  const handleTimeSignatureChange = useCallback(
    (value: string) => {
      if (!currentPattern || !selectedTrackId) return;

      const track = currentPattern.tracks.find((t) => t.id === selectedTrackId);
      if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) return;

      const [numerator, denominator] = value.split("/").map(Number);
      const stepData = track.data;

      updatePatternData(currentPattern.id, selectedTrackId, {
        ...stepData,
        timeSignature: [numerator, denominator],
        stepsPerMeasure: calculateStepsPerMeasure(
          [numerator, denominator],
          stepData.gridResolution,
        ),
      });
    },
    [currentPattern, selectedTrackId, updatePatternData],
  );

  const handleStepDurationChange = useCallback(
    (value: string) => {
      if (!currentPattern || !selectedTrackId) return;

      const track = currentPattern.tracks.find((t) => t.id === selectedTrackId);
      if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) return;

      const stepData = track.data;

      updatePatternData(currentPattern.id, selectedTrackId, {
        ...stepData,
        gridResolution: getGridResolutionFromDuration(value),
        stepsPerMeasure: calculateStepsPerMeasure(
          stepData.timeSignature,
          getGridResolutionFromDuration(value),
        ),
      });
    },
    [currentPattern, selectedTrackId, updatePatternData],
  );

  if (!currentPattern) {
    return (
      <div className="bg-slate-50 p-2 col-span-1 text-center text-gray-500">
        No pattern selected
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-2 col-span-1">
      <h3 className="text-lg font-bold mb-4">Track Settings</h3>

      <div className="mb-4">
        <Label htmlFor="trackSelect">Select Track</Label>
        <Select onValueChange={handleTrackChange} value={selectedTrackId ?? ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a track" />
          </SelectTrigger>
          <SelectContent>
            {currentPattern.tracks.map((track) => (
              <SelectItem key={track.id} value={track.id}>
                {track.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTrack && (
        <div className="mb-4">
          <Label htmlFor="instrumentSelect">Instrument</Label>
          <Select
            onValueChange={handleInstrumentChange}
            value={selectedTrack.instrumentId || InstrumentName.Synth}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an instrument" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(InstrumentName).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mb-4">
        <Label htmlFor="globalBpm">Global BPM</Label>
        <Input
          type="number"
          id="globalBpm"
          value={globalBpm.toString()}
          onChange={(e) => handleBpmChange(e.target.value)}
          min={1}
        />
      </div>

      {selectedTrack &&
        selectedTrack.data.type === PatternTrackType.STEP_SEQUENCE && (
          <>
            <div className="mb-4">
              <Label htmlFor={`timeSignature-track-${selectedTrack.id}`}>
                Time Signature
              </Label>
              <Select
                onValueChange={handleTimeSignatureChange}
                value={`${(selectedTrack.data as StepSequenceData).timeSignature[0]}/${
                  (selectedTrack.data as StepSequenceData).timeSignature[1]
                }`}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    id={`timeSignature-track-${selectedTrack.id}`}
                    placeholder="Select time signature"
                  />
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
              <Label htmlFor={`stepDuration-track-${selectedTrack.id}`}>
                Grid Resolution
              </Label>
              <Select
                onValueChange={handleStepDurationChange}
                value={getDurationFromGridResolution(
                  selectedTrack.data.gridResolution,
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    id={`stepDuration-track-${selectedTrack.id}`}
                    placeholder="Select grid resolution"
                  />
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

            <div className="mb-4">
              <Label htmlFor="steps-per-measure">Steps per Measure: </Label>
              <span id="steps-per-measure" className="font-bold">
                {selectedTrack.data.stepsPerMeasure}
              </span>
            </div>

            {/* <TrackAnalytics trackId={selectedTrack.id} /> */}
          </>
        )}
    </div>
  );
};

// Utility functions
const calculateStepsPerMeasure = (
  timeSignature: [number, number],
  gridResolution: number,
): number => {
  const [numerator, denominator] = timeSignature;
  return (numerator * gridResolution) / (denominator / 4);
};

const getGridResolutionFromDuration = (duration: string): number => {
  const resolutionMap: Record<string, number> = {
    "1n": 1,
    "2n": 2,
    "4n": 4,
    "8n": 8,
    "16n": 16,
    "32n": 32,
  };
  return resolutionMap[duration] || 16;
};

const getDurationFromGridResolution = (resolution: number): string => {
  const durationMap: Record<number, string> = {
    1: "1n",
    2: "2n",
    4: "4n",
    8: "8n",
    16: "16n",
    32: "32n",
  };
  return durationMap[resolution] || "16n";
};

export default SequencerTrackSettings;
