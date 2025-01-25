// src/features/clips/types.ts
import { EngineState } from "@/core/stores/useEngineStore";
import { MidiFile } from "midifile-ts";

export interface Clip {
  id: string;
  name: string;
  trackId: string;
  inputNode: AudioNode;
  outputNode: GainNode;
  panNode: StereoPannerNode;
  startTime: number;
  endTime: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

export interface MidiClip extends Clip {
  midiData: MidiFile;
}

export interface AudioClip extends Clip {}

export interface ClipState {
  clips: Record<string, Clip>;
}

export interface ClipEngine {
  importMidiFile(
    state: EngineState,
    trackId: string,
    file: File,
    name?: string,
  ): ClipState;
  createMidiClip(
    state: EngineState,
    trackId: string,
    midiData: MidiFile,
    name?: string,
  ): ClipState;

  dispose(state: ClipState): void;
}
