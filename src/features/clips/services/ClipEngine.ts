// src/features/clips/services/ClipEngine.ts
import { MidiFile, read } from "midifile-ts";
import { ClipEngine, ClipState } from "../types";
import { ClipMidiService } from "./ClipMidiService";
import { MixRoutingService } from "@/features/mix/services/MixRoutingService";
import { ClipAudioService } from "./ClipAudioService";
import { EngineState } from "@/core/stores/useEngineStore";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;
  private midiService: ClipMidiService;
  private audioService: ClipAudioService;

  constructor(
    private audioContext: AudioContext,
    private routingService: MixRoutingService,
  ) {
    this.midiService = new ClipMidiService(
      this.audioContext,
      this.routingService,
    );
    this.audioService = new ClipAudioService(
      this.audioContext,
      this.routingService,
    );
  }

  importMidiFile(
    state: EngineState,
    trackId: string,
    file: File,
    name?: string,
  ): ClipState {
    const track = state.mix.mixer.tracks[trackId];

    if (track == null) {
      throw new Error("Track not found");
    } else if (track.type !== "midi") {
      throw new Error("Track is not a MIDI track");
    }

    const reader = new FileReader();
    let midi: MidiFile | null = null;

    reader.onload = (e) => {
      if (e.target == null) {
        return;
      }
      const data = e.target.result as ArrayBuffer;
      midi = read(data);
    };

    reader.readAsArrayBuffer(file);

    if (midi === null) {
      throw new Error("Failed to read MIDI file");
    } else {
      const clip = this.midiService.createMidiClip(trackId, midi, name);
      this.routingService.connect(clip.outputNode, track.inputNode);
      return {
        ...state.clips,
        clips: {
          ...state.clips.clips,
          [clip.id]: clip,
        },
      };
    }
  }

  createMidiClip(
    state: EngineState,
    trackId: string,
    midiData: MidiFile,
    name?: string,
  ): ClipState {
    const track = state.mix.mixer.tracks[trackId];

    if (track == null) {
      throw new Error("Track not found");
    } else if (track.type !== "midi") {
      throw new Error("Track is not a MIDI track");
    }

    const clip = this.midiService.createMidiClip(trackId, midiData, name);
    return {
      ...state.clips,
      clips: {
        ...state.clips.clips,
        [clip.id]: clip,
      },
    };
  }

  dispose(state: ClipState): void {
    if (this.disposed) return;

    this.disposed = true;
  }
}
