// src/views/MainView.tsx

import React, { useEffect, useRef } from "react";
import Sequencer from "@/features/sequencer/components/Sequencer";
import Mixer from "@/features/mixer/components/Mixer";
import { TopBar } from "@/common/components/TopBar";
import { useSequencerStore } from "@/features/sequencer/slices/useSequencerStore";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import { Note } from "@/core/enums/note";
import { InstrumentName } from "@/core/enums/instrumentName";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";
import { PlaybackMode } from "@/core/interfaces";
import { PatternTrack } from "@/core/interfaces/pattern";

const MainView: React.FC = () => {
  const hasInitialized = useRef(false);
  const setPlaybackMode = useSequencerStore((state) => state.setPlaybackMode);
  const setCurrentPattern = useSequencerStore(
    (state) => state.setCurrentPattern,
  );
  const createPattern = usePatternStore((state) => state.addPattern);
  const patterns = usePatternStore((state) => state.patterns);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log("Initializing application...");

    // Set pattern mode
    setPlaybackMode(PlaybackMode.PATTERN);

    // Create initial pattern if none exists
    if (patterns.length === 0) {
      console.log("Creating initial pattern...");

      const defaultTrack: PatternTrack = {
        id: `track_${Date.now()}`,
        name: "Track 1",
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

      // Create the pattern
      const patternId = createPattern({
        name: "Pattern 1",
        length: 4,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        tracks: [defaultTrack],
        timeSignature: [4, 4],
      });

      console.log("Created pattern with ID:", patternId);

      // Initialize instrument and connect to master
      instrumentManager.addInstrument(
        defaultTrack.instrumentId,
        InstrumentName.Synth,
        "master",
      );

      // Set as current pattern in sequencer store
      setCurrentPattern(patternId);
    }
  }, []); // Empty dependency array since we're using ref for control

  return (
    <div className="flex flex-col">
      <TopBar />
      <div className="">
        <Sequencer />
      </div>
      <div className="">
        <Mixer />
      </div>
    </div>
  );
};

export default MainView;
