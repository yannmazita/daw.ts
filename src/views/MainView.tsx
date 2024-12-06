// src/views/MainView.tsx

import React, { useCallback, useLayoutEffect } from "react";
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
  const setPlaybackMode = useSequencerStore((state) => state.setPlaybackMode);
  const setCurrentPattern = useSequencerStore(
    (state) => state.setCurrentPattern,
  );
  const initialized = useSequencerStore((state) => state.initialized);
  const initialize = useSequencerStore((state) => state.initialize);
  const createPattern = usePatternStore((state) => state.addPattern);
  const patterns = usePatternStore((state) => state.patterns);

  const initializeApplication = useCallback(() => {
    if (initialized) return;

    // Initialize sequencer store
    initialize();

    // Set pattern mode
    setPlaybackMode(PlaybackMode.PATTERN);

    // Create initial pattern if none exists
    if (patterns.length === 0) {
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

      // Initialize instrument and connect to master
      instrumentManager.addInstrument(
        defaultTrack.instrumentId,
        InstrumentName.Synth,
        "master",
      );

      // Set as current pattern in sequencer store
      setCurrentPattern(patternId);
    } else if (patterns.length > 0) {
      // If patterns exist but none selected, select the first one
      setCurrentPattern(patterns[0].id);
    }
  }, [
    initialized,
    initialize,
    setPlaybackMode,
    createPattern,
    setCurrentPattern,
    patterns,
  ]);

  useLayoutEffect(() => {
    initializeApplication();
  }, [initializeApplication]);

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
