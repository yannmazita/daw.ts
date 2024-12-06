// src/features/sequencer/components/SequencerVisualisation/SequencerVisualisation.tsx

import React from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { useSequencerStore } from "../../slices/useSequencerStore";
import TrackVisualisation from "./TrackVisualisation";
import "../../styles/style.css";

const SequencerVisualisation: React.FC = () => {
  const initialized = useSequencerStore((state) => state.initialized);
  const currentPatternId = useSequencerStore((state) => state.currentPatternId);
  const currentPattern = usePatternStore((state) =>
    state.patterns.find((p) => p.id === currentPatternId),
  );

  // Don't render until initialized
  if (!initialized) {
    return (
      <div className="bg-slate-50 p-2 text-center text-gray-500">
        Initializing...
      </div>
    );
  }

  if (!currentPattern) {
    return (
      <div className="bg-slate-50 p-2 text-center text-gray-500">
        No pattern selected
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-2 overflow-x-auto">
      <div className="inline-block min-w-full">
        {currentPattern.tracks.map((track) => (
          <TrackVisualisation
            key={track.id}
            trackId={track.id}
            patternId={currentPattern.id}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(SequencerVisualisation);
