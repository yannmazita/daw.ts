// src/core/interfaces/sequencer.ts

import { InstrumentName, Note, SequenceStatus } from "../enums";

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

export interface SequencerStep {
  trackIndex: number;
  stepIndex: number;
  active: boolean;
  note: Note;
  velocity: number;
  modulation: number;
  pitchBend: number;
}

export interface SequencerTrackInfo {
  trackIndex: number;
  instrumentId: string;
  instrumentName: InstrumentName;
  muted: boolean;
  solo: boolean;
  timeSignature: [number, number];
  stepDuration: string;
  stepsPerMeasure: number;
  bpm: number;
  commonVelocity: number | null;
  commonNote: Note | null;
  loopLength: number;
}

export interface SequencerPlayback {
  status: SequenceStatus;
  currentStep: number;
  visualStep: number;
}

export interface SequencerState {
  status: SequenceStatus;
  steps: SequencerStep[];
  trackInfo: SequencerTrackInfo[];
  globalBpm: number;
  currentStep: number;
  setStatus: (status: SequenceStatus) => void;
  setGlobalBpm: (bpm: number) => void;
  addTrack: (track: SequencerTrackInfo) => void;
  updateTrackInfo: (
    update: Partial<SequencerTrackInfo> & { trackIndex: number },
  ) => void;
  updateStepsForTrack: (
    trackIndex: number,
    updatedSteps: SequencerStep[],
  ) => void;
  setStep: (step: SequencerStep) => void;
  setSteps: (steps: SequencerStep[]) => void;
  setCurrentStep: (step: number) => void;
  toggleStep: (trackIndex: number, stepIndex: number) => void;
  initializeTracks: (numTracks: number) => void;
  updateTrackInfoAndSteps: (
    trackInfoUpdate: Partial<SequencerTrackInfo> & { trackIndex: number },
  ) => void;
  setTrackInstrument: (trackIndex: number, instrument: InstrumentName) => void;
  initializeSequencer: (numTracks: number) => void;
}
