// src/features/patterns/components/PatternList.tsx

import React, { useCallback } from "react";
import { usePatternStore } from "../slices/usePatternStore";
import { Button } from "@/common/shadcn/ui/button";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import { Note } from "@/core/enums/note";
import { InstrumentName } from "@/core/enums/instrumentName";
import { useMixerStore } from "@/features/mixer/slices/useMixerStore";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";
import { useSequencerStore } from "@/features/sequencer/slices/useSequencerStore";
import { PatternTrack } from "@/core/interfaces/pattern";

export const PatternList: React.FC = () => {
  const patterns = usePatternStore((state) => state.patterns);
  const currentPatternId = useSequencerStore((state) => state.currentPatternId);
  const addPattern = usePatternStore((state) => state.addPattern);
  const deletePattern = usePatternStore((state) => state.deletePattern);
  const setCurrentPattern = useSequencerStore(
    (state) => state.setCurrentPattern,
  );

  const handleCreatePattern = useCallback(() => {
    const defaultTrack: PatternTrack = {
      id: `track_${Date.now()}`,
      name: `Track ${patterns.length + 1}`,
      type: PatternTrackType.STEP_SEQUENCE,
      mixerChannelId: "master",
      instrumentId: `instrument_${Date.now()}`,
      muted: false,
      solo: false,
      data: {
        type: PatternTrackType.STEP_SEQUENCE,
        steps: Array(16)
          .fill(null)
          .map((_, i) => ({
            index: i,
            velocity: 100,
            active: false,
            note: Note.C4,
            modulation: 0,
            pitchBend: 0,
            parameters: {},
          })),
        gridResolution: 16,
        loopLength: 16,
        swing: 0,
        defaultNote: Note.C4,
        defaultVelocity: 100,
      },
      automationData: [],
    };

    const patternId = addPattern({
      name: `Pattern ${patterns.length + 1}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      length: 4,
      timeSignature: [4, 4],
      tracks: [defaultTrack],
    });

    instrumentManager.addInstrument(
      defaultTrack.instrumentId,
      InstrumentName.Synth,
      "master",
    );

    setCurrentPattern(patternId);
  }, [addPattern, patterns.length, setCurrentPattern]);

  const handleDeletePattern = useCallback(
    (patternId: string) => {
      const pattern = patterns.find((p) => p.id === patternId);
      if (!pattern) return;

      // Clean up associated resources
      pattern.tracks.forEach((track) => {
        // Remove instrument
        instrumentManager.removeInstrument(track.instrumentId);
        // Remove mixer channel
        useMixerStore.getState().removeChannel(track.mixerChannelId);
      });

      // Delete the pattern
      deletePattern(patternId);
    },
    [patterns, deletePattern],
  );

  return (
    <div className="bg-slate-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Patterns</h3>
        <Button onClick={handleCreatePattern}>Create Pattern</Button>
      </div>

      <div className="space-y-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className={`flex items-center justify-between p-2 rounded ${
              pattern.id === currentPatternId
                ? "bg-blue-100 border-blue-300"
                : "bg-white"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: pattern.color }}
            />
            <span className="flex-grow">{pattern.name}</span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPattern(pattern.id)}
              >
                Select
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePattern(pattern.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
