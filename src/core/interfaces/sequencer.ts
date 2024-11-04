// src/core/interfaces/sequencer.ts

import { SequencerTrack } from "@/features/sequencer/models/SequencerModels";
import { SequenceStatus } from "../enums";

/**
 * Represents a specific position within a sequencer, which could correspond to a particular
 * track and step in a musical sequence.
 */
export interface StepPosition {
  /** The index of the track within the sequencer, or -1 if not applicable. */
  trackIndex: number;

  /** The index of the step within the track, or -1 if not applicable. */
  stepIndex: number;
}

export interface PlaybackState {
  status: SequenceStatus;
  bpm: number;
  currentStep: number;
  visualStep: number;
  stepDuration: string;
  timeSignature: [number, number];
}

export interface SequencerState {
  playback: {
    status: SequenceStatus;
    bpm: number;
    currentStep: number;
    visualStep: number;
    stepDuration: string;
    timeSignature: [number, number];
  };
  structure: {
    numTracks: number;
    numSteps: number;
    rightClickSelectionPosition: StepPosition;
  };
}

export interface TrackState {
  activeTrackId: number | null;
  tracks: SequencerTrack[];
}
