// src/features/sequencer/components/SequencerVisualisation/TrackVisualisation.tsx

import React from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import StepVisualisation from "./StepVisualisation";
import PianoRollVisualisation from "./PianoRollVisualisation";
import AudioTrackVisualisation from "./AudioTrackVisualisation";

interface TrackVisualisationProps {
  trackId: string;
  patternId: string;
}

const TrackVisualisation: React.FC<TrackVisualisationProps> = React.memo(
  ({ trackId, patternId }) => {
    const track = usePatternStore((state) =>
      state.patterns
        .find((p) => p.id === patternId)
        ?.tracks.find((t) => t.id === trackId),
    );

    if (!track) return null;

    return (
      <div
        id={`track-visualisation-${trackId}`}
        className={`${track.muted ? "opacity-50" : ""}`}
      >
        {track.data.type === PatternTrackType.STEP_SEQUENCE && (
          <StepVisualisation trackId={trackId} patternId={patternId} />
        )}
        {track.data.type === PatternTrackType.PIANO_ROLL && (
          <PianoRollVisualisation trackId={trackId} patternId={patternId} />
        )}
        {track.data.type === PatternTrackType.AUDIO && (
          <AudioTrackVisualisation trackId={trackId} patternId={patternId} />
        )}
      </div>
    );
  },
);

export default TrackVisualisation;
